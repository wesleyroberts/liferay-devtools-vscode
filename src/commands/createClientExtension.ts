import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  CLIENT_EXTENSION_TEMPLATES,
  ClientExtensionTemplateId,
  generateClientExtension,
  getClientExtensionTemplate
} from "../core/clientExtensionGenerator";

export function registerCreateClientExtensionCommands(
  context: vscode.ExtensionContext
) {
  const commandConfigs: Array<{
    command: string;
    templateId?: ClientExtensionTemplateId;
  }> = [
    {
      command: "liferay.createClientExtension"
    },
    {
      command: "liferay.createClientExtension.customElement",
      templateId: "custom-element"
    },
    {
      command: "liferay.createClientExtension.customElementReactVite",
      templateId: "custom-element-react-vite"
    },
    {
      command: "liferay.createClientExtension.customElementAngular",
      templateId: "custom-element-angular"
    },
    {
      command: "liferay.createClientExtension.globalJS",
      templateId: "global-js"
    },
    {
      command: "liferay.createClientExtension.globalJSInstance",
      templateId: "global-js-instance"
    },
    {
      command: "liferay.createClientExtension.globalCSS",
      templateId: "global-css"
    },
    {
      command: "liferay.createClientExtension.globalCSSCompany",
      templateId: "global-css-company"
    },
    {
      command: "liferay.createClientExtension.globalCSSPage",
      templateId: "global-css-page"
    },
    {
      command: "liferay.createClientExtension.iframe",
      templateId: "iframe"
    },
    {
      command: "liferay.createClientExtension.siteInitializer",
      templateId: "site-initializer"
    },
    {
      command: "liferay.createClientExtension.batch",
      templateId: "batch"
    },
    {
      command: "liferay.createClientExtension.etcCron",
      templateId: "etc-cron"
    },
    {
      command: "liferay.createClientExtension.etcNode",
      templateId: "etc-node"
    },
    {
      command: "liferay.createClientExtension.etcSpringBoot",
      templateId: "etc-spring-boot"
    }
  ];

  for (const config of commandConfigs) {
    const disposable = vscode.commands.registerCommand(
      config.command,
      async (resource?: vscode.Uri) => {
        await runCreateClientExtensionFlow(context, resource, config.templateId);
      }
    );

    context.subscriptions.push(disposable);
  }
}

async function runCreateClientExtensionFlow(
  context: vscode.ExtensionContext,
  resource: vscode.Uri | undefined,
  initialTemplateId?: ClientExtensionTemplateId
) {
  try {
    const clientExtensionsDir = await resolveClientExtensionsDir(resource);
    if (!clientExtensionsDir) {
      return;
    }

    const templateId = initialTemplateId ?? (await pickTemplateId());
    if (!templateId) {
      return;
    }

    const template = getClientExtensionTemplate(templateId);

    const projectName = await vscode.window.showInputBox({
      prompt: `Nome da pasta para ${template.label}`,
      placeHolder: "ex: acme-global-js",
      validateInput: validateProjectName
    });

    if (!projectName) {
      return;
    }

    const projectDir = path.join(clientExtensionsDir, projectName);

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Criando client extension ${projectName}...`,
        cancellable: false
      },
      async () => {
        await generateClientExtension({
          context,
          clientExtensionsDir,
          projectName,
          templateId
        });
      }
    );

    const openOption = "Abrir pasta";
    const revealOption = "Revelar no Explorer";
    const choice = await vscode.window.showInformationMessage(
      `Client extension criada com sucesso: ${projectDir}`,
      openOption,
      revealOption
    );

    if (choice === openOption) {
      await vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(projectDir),
        true
      );
      return;
    }

    if (choice === revealOption) {
      await vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(projectDir)
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";

    vscode.window.showErrorMessage(
      `Failed to create client extension: ${message}`
    );
  }
}

async function pickTemplateId(): Promise<ClientExtensionTemplateId | undefined> {
  const choice = await vscode.window.showQuickPick(
    CLIENT_EXTENSION_TEMPLATES.map((template) => ({
      label: template.label,
      description: template.description,
      detail: template.detail,
      value: template.id
    })),
    {
      placeHolder: "Escolha o tipo de client extension"
    }
  );

  return choice?.value;
}

async function resolveClientExtensionsDir(
  resource: vscode.Uri | undefined
): Promise<string | undefined> {
  if (resource && path.basename(resource.fsPath) === "client-extensions") {
    return resource.fsPath;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  const matchingDirs: string[] = [];

  for (const folder of workspaceFolders) {
    const candidateDir = path.join(folder.uri.fsPath, "client-extensions");

    try {
      await fs.access(candidateDir);
      matchingDirs.push(candidateDir);
    } catch {
      continue;
    }
  }

  if (matchingDirs.length === 1) {
    return matchingDirs[0];
  }

  if (matchingDirs.length > 1) {
    const choice = await vscode.window.showQuickPick(
      matchingDirs.map((dir) => ({
        label: path.basename(path.dirname(dir)),
        description: dir,
        value: dir
      })),
      {
        placeHolder: "Escolha em qual pasta client-extensions deseja criar"
      }
    );

    return choice?.value;
  }

  vscode.window.showWarningMessage(
    "Nenhuma pasta client-extensions foi encontrada no workspace atual."
  );

  return undefined;
}

function validateProjectName(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Informe o nome da pasta";
  }

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return "Use apenas letras minusculas, numeros e hifens";
  }

  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return "Nao comece ou termine com hifen";
  }

  return undefined;
}

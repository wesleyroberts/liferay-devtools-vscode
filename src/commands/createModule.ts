import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  generateOsgiModule,
  getOsgiModuleTemplate,
  OSGI_MODULE_TEMPLATES,
  OsgiModuleTemplateId
} from "../core/osgiModuleGenerator";

export function registerCreateModuleCommands(context: vscode.ExtensionContext) {
  const commandConfigs: Array<{
    command: string;
    templateId?: OsgiModuleTemplateId;
  }> = [
    {
      command: "liferay.createModule"
    },
    {
      command: "liferay.createModule.mvcPortlet",
      templateId: "mvc-portlet"
    },
    {
      command: "liferay.createModule.apiService",
      templateId: "api-service"
    },
    {
      command: "liferay.createModule.portletReact",
      templateId: "portlet-react"
    }
  ];

  for (const config of commandConfigs) {
    const disposable = vscode.commands.registerCommand(
      config.command,
      async (resource?: vscode.Uri) => {
        await runCreateModuleFlow(context, resource, config.templateId);
      }
    );

    context.subscriptions.push(disposable);
  }
}

async function runCreateModuleFlow(
  context: vscode.ExtensionContext,
  resource: vscode.Uri | undefined,
  initialTemplateId?: OsgiModuleTemplateId
) {
  try {
    const modulesDir = await resolveModulesDir(resource);

    if (!modulesDir) {
      return;
    }

    const templateId = initialTemplateId ?? (await pickTemplateId());

    if (!templateId) {
      return;
    }

    const template = getOsgiModuleTemplate(templateId);
    const projectName = await vscode.window.showInputBox({
      prompt: `Nome da pasta para ${template.label}`,
      placeHolder: "ex: acme-foo",
      validateInput: validateProjectName
    });

    if (!projectName) {
      return;
    }

    const projectDir = path.join(modulesDir, projectName);

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Criando modulo OSGi ${projectName}...`,
        cancellable: false
      },
      async () => {
        await generateOsgiModule({
          context,
          modulesDir,
          projectName,
          templateId
        });
      }
    );

    const openOption = "Abrir pasta";
    const revealOption = "Revelar no Explorer";
    const choice = await vscode.window.showInformationMessage(
      `Modulo OSGi criado com sucesso: ${projectDir}`,
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

    vscode.window.showErrorMessage(`Failed to create OSGi module: ${message}`);
  }
}

async function pickTemplateId(): Promise<OsgiModuleTemplateId | undefined> {
  const choice = await vscode.window.showQuickPick(
    OSGI_MODULE_TEMPLATES.map((template) => ({
      label: template.label,
      description: template.description,
      detail: template.detail,
      value: template.id
    })),
    {
      placeHolder: "Escolha o tipo de modulo OSGi"
    }
  );

  return choice?.value;
}

async function resolveModulesDir(
  resource: vscode.Uri | undefined
): Promise<string | undefined> {
  if (resource && isModulesDir(resource.fsPath)) {
    return resource.fsPath;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  const matchingDirs: string[] = [];

  for (const folder of workspaceFolders) {
    for (const dirName of ["modules", "modulos"]) {
      const candidateDir = path.join(folder.uri.fsPath, dirName);

      try {
        await fs.access(candidateDir);
        matchingDirs.push(candidateDir);
      } catch {
        continue;
      }
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
        placeHolder: "Escolha em qual pasta modules deseja criar"
      }
    );

    return choice?.value;
  }

  vscode.window.showWarningMessage(
    "Nenhuma pasta modules/modulos foi encontrada no workspace atual."
  );

  return undefined;
}

function isModulesDir(dirPath: string): boolean {
  const dirName = path.basename(dirPath).toLowerCase();

  return dirName === "modules" || dirName === "modulos";
}

function validateProjectName(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Informe o nome da pasta";
  }

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return "Use apenas letras minusculas, numeros e hifens";
  }

  if (!/^[a-z]/.test(trimmed)) {
    return "Comece com uma letra para gerar classes Java validas";
  }

  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return "Nao comece ou termine com hifen";
  }

  return undefined;
}

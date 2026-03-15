import * as path from "node:path";
import * as vscode from "vscode";
import {
  COMMUNITY_VERSIONS,
  DXP_VERSIONS,
  LiferayEdition
} from "../core/versions";
import { generateWorkspace } from "../core/workspaceGenerator";
import { runGradleCommand } from "../core/gradleRunner";
import { validateJava } from "../core/javaValidator";

export function registerCreateWorkspaceCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "liferay.createWorkspace",
    async () => {
      try {
        const edition = await pickEdition();
        if (!edition) {
          return;
        }

        const productVersion = await pickProductVersion(edition);
        if (!productVersion) {
          return;
        }

        const workspaceName = await vscode.window.showInputBox({
          prompt: "Nome do workspace",
          placeHolder: "ex: acme-liferay-workspace",
          validateInput: (value) => {
            if (!value.trim()) {
              return "Informe o nome do workspace";
            }

            if (/[\\/:\*\?"<>\|]/.test(value)) {
              return "O nome contém caracteres inválidos para pasta";
            }

            return undefined;
          }
        });

        if (!workspaceName) {
          return;
        }

        const selectedFolder = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Selecionar pasta destino"
        });

        if (!selectedFolder?.length) {
          return;
        }

        const baseDir = selectedFolder[0].fsPath;
        const workspaceDir = path.join(baseDir, workspaceName);

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Criando workspace ${workspaceName}...`,
            cancellable: false
          },
          async () => {
            await generateWorkspace({
              context,
              workspaceDir,
              workspaceName,
              productVersion
            });

            await validateJava();

            await runGradleCommand(workspaceDir, ["--version"]);
          }
        );

        const downloadBundle = await vscode.window.showInformationMessage(
          "Workspace criado com sucesso. Deseja baixar o bundle do Liferay agora?",
          "Sim",
          "Não"
        );

        if (downloadBundle === "Sim") {
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Baixando o bundle do Liferay...",
              cancellable: false
            },
            async () => {
              await runGradleCommand(workspaceDir, ["initBundle"]);
            }
          );
        }

        const openOption = "Abrir workspace";
        const choice = await vscode.window.showInformationMessage(
          `Workspace criado com sucesso: ${workspaceDir}`,
          openOption
        );

        if (choice === openOption) {
          await vscode.commands.executeCommand(
            "vscode.openFolder",
            vscode.Uri.file(workspaceDir),
            true
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";

        vscode.window.showErrorMessage(
          `Failed to create workspace: ${message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function pickEdition(): Promise<LiferayEdition | undefined> {
  const choice = await vscode.window.showQuickPick(
    [
      {
        label: "DXP",
        description: "Liferay DXP 7.4",
        value: "dxp" as LiferayEdition
      },
      {
        label: "Community",
        description: "Liferay Portal GA 7.4",
        value: "community" as LiferayEdition
      }
    ],
    {
      placeHolder: "Escolha a edição do Liferay"
    }
  );

  return choice?.value;
}

async function pickProductVersion(
  edition: LiferayEdition
): Promise<string | undefined> {
  const options = edition === "dxp" ? DXP_VERSIONS : COMMUNITY_VERSIONS;

  const choice = await vscode.window.showQuickPick(
    options.map((option) => ({
      label: option.label,
      description: option.value,
      value: option.value
    })),
    {
      placeHolder: "Escolha a versão do produto"
    }
  );

  return choice?.value;
}

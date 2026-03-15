import * as vscode from "vscode";
import { runGradleCommand } from "../core/gradleRunner";
import { validateJava } from "../core/javaValidator";
import { liferayOutput } from "../core/output";

export function registerDownloadBundleCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "liferay.downloadBundle",
    async () => {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
          vscode.window.showErrorMessage(
            "Abra um Liferay Workspace antes de baixar o bundle."
          );
          return;
        }

        const workspaceDir = workspaceFolder.uri.fsPath;
        let progressValue = 0;

        liferayOutput.show(true);

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Baixando bundle do Liferay...",
            cancellable: false
          },
          async (progress) => {
            progress.report({
              increment: 5,
              message: "Validando Java..."
            });

            await validateJava();

            progressValue = 10;
            progress.report({
              increment: 5,
              message: "Iniciando Gradle..."
            });

            await runGradleCommand(workspaceDir, ["initBundle"], {
              onLine: (line) => {
                const nextMessage = mapGradleLineToMessage(line);
                const nextIncrement = progressValue < 90 ? 2 : 0;

                if (nextIncrement > 0) {
                  progressValue += nextIncrement;
                }

                progress.report({
                  increment: nextIncrement,
                  message: nextMessage
                });
              }
            });

            if (progressValue < 100) {
              progress.report({
                increment: 100 - progressValue,
                message: "Bundle finalizado."
              });
            }
          }
        );

        vscode.window.showInformationMessage("Bundle baixado com sucesso.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";

        vscode.window.showErrorMessage(
          `Falha ao baixar o bundle: ${message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function mapGradleLineToMessage(line: string): string {
  const normalized = line.toLowerCase();

  if (normalized.includes(":verifyproduct")) {
    return "Verificando produto...";
  }

  if (normalized.includes(":downloadbundle skipped")) {
    return "Download do bundle foi ignorado.";
  }

  if (normalized.includes(":downloadbundle")) {
    return "Baixando bundle...";
  }

  if (normalized.includes(":verifybundle")) {
    return "Verificando bundle...";
  }

  if (normalized.includes(":initbundle")) {
    return "Inicializando bundle...";
  }

  if (normalized.includes("build successful")) {
    return "Build concluido com sucesso.";
  }

  if (normalized.includes("build failed")) {
    return "Build falhou.";
  }

  if (normalized.includes("downloading")) {
    return line;
  }

  if (normalized.includes("download")) {
    return line;
  }

  if (normalized.includes("extract")) {
    return "Extraindo bundle...";
  }

  if (normalized.includes("building")) {
    return "Processando tarefa Gradle...";
  }

  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
}

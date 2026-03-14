import * as path from 'node:path';
import * as vscode from 'vscode';
import {
  COMMUNITY_VERSIONS,
  DXP_VERSIONS,
  LiferayEdition
} from '../core/versions';
import { generateWorkspace } from '../core/workspaceGenerator';
import { runGradleTasks } from '../core/gradleRunner';
import { validateJava } from '../core/javaValidator';

export function registerCreateWorkspaceCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'liferay.createWorkspace',
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
          prompt: 'Workspace name',
          placeHolder: 'ex: acme-liferay-workspace',
          validateInput: (value) =>
            value.trim().length > 0 ? undefined : 'Enter a workspace name'
        });

        if (!workspaceName) {
          return;
        }

        const selectedFolder = await vscode.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: 'Select target folder'
        });

        if (!selectedFolder?.length) {
          return;
        }

        const baseDir = selectedFolder[0].fsPath;
        const workspaceDir = path.join(baseDir, workspaceName);

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Creating ${workspaceName}...`,
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
            await runGradleTasks(workspaceDir);
          }
        );

        const openOption = 'Open workspace';
        const choice = await vscode.window.showInformationMessage(
          `Workspace created successfully: ${workspaceDir}`,
          openOption
        );

        if (choice === openOption) {
          await vscode.commands.executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(workspaceDir),
            true
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';

        await vscode.window.showErrorMessage(
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
      { label: 'DXP', value: 'dxp' as LiferayEdition },
      { label: 'Community', value: 'community' as LiferayEdition }
    ],
    {
      placeHolder: 'Choose Liferay edition'
    }
  );

  return choice?.value;
}

async function pickProductVersion(
  edition: LiferayEdition
): Promise<string | undefined> {
  const options = edition === 'dxp' ? DXP_VERSIONS : COMMUNITY_VERSIONS;

  const choice = await vscode.window.showQuickPick(
    options.map((option) => ({
      label: option.label,
      description: option.value,
      value: option.value
    })),
    {
      placeHolder: 'Choose product version'
    }
  );

  return choice?.value;
}

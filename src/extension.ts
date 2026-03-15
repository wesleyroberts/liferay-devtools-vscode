import * as vscode from "vscode";
import { registerCreateWorkspaceCommand } from "./commands/createWorkspace";
import { registerDownloadBundleCommand } from "./commands/downloadBundle";

export function activate(context: vscode.ExtensionContext) {
  registerCreateWorkspaceCommand(context);
  registerDownloadBundleCommand(context);
}

export function deactivate() {}

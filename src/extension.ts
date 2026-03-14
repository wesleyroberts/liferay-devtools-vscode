import * as vscode from "vscode";
import { registerCreateWorkspaceCommand } from "./commands/createWorkspace";

export function activate(context: vscode.ExtensionContext) {
  registerCreateWorkspaceCommand(context);
}

export function deactivate() {}

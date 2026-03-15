import * as vscode from "vscode";

export const liferayOutput = vscode.window.createOutputChannel(
  "Liferay Workspace"
);

export function log(message: string) {
  liferayOutput.appendLine(message);
}

import * as vscode from "vscode";
import { registerCreateClientExtensionCommands } from "./commands/createClientExtension";
import { registerCreateModuleCommands } from "./commands/createModule";
import { registerCreateWorkspaceCommand } from "./commands/createWorkspace";
import { registerDeployProjectCommand } from "./commands/deployProject";
import { registerDownloadBundleCommand } from "./commands/downloadBundle";
import { registerManagePortalCommands } from "./commands/managePortal";
import { PortalRuntime } from "./core/portalRuntime";

export function activate(context: vscode.ExtensionContext) {
  const portalRuntime = new PortalRuntime();

  registerCreateWorkspaceCommand(context);
  registerCreateClientExtensionCommands(context);
  registerCreateModuleCommands(context);
  registerDeployProjectCommand(context);
  registerDownloadBundleCommand(context);
  registerManagePortalCommands(context, portalRuntime);

  context.subscriptions.push(portalRuntime);
}

export function deactivate() {}

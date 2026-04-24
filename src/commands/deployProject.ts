import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { runGradleCommand } from "../core/gradleRunner";
import { validateJava } from "../core/javaValidator";
import { liferayOutput } from "../core/output";

type DeployTargetKind = "client-extension" | "osgi-module";

interface DeployTarget {
  workspaceDir: string;
  projectDir: string;
  taskPath: string;
  displayName: string;
  kind: DeployTargetKind;
}

const CLIENT_EXTENSIONS_DIR = "client-extensions";
const MODULES_DIR_NAMES = new Set(["modules", "modulos"]);
const IGNORED_DIR_NAMES = new Set([
  ".git",
  ".gradle",
  ".idea",
  ".vscode",
  "bin",
  "build",
  "dist",
  "node_modules",
  "out",
  "target"
]);

export function registerDeployProjectCommand(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "liferay.deployProject",
    async (resource?: vscode.Uri) => {
      try {
        const target = await resolveDeployTarget(resource);

        if (!target) {
          return;
        }

        let progressValue = 0;
        const deployTask = `${target.taskPath}:deploy`;
        const deployLabel = getDeployLabel(target);

        liferayOutput.show(true);

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Executando deploy de ${deployLabel}...`,
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

            await runGradleCommand(target.workspaceDir, [deployTask], {
              onLine: (line) => {
                const nextMessage = mapGradleLineToDeployMessage(line);
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
                message: "Deploy concluido."
              });
            }
          }
        );

        vscode.window.showInformationMessage(
          `Deploy concluido com sucesso para ${deployLabel}.`
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";

        vscode.window.showErrorMessage(`Falha ao executar deploy: ${message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function resolveDeployTarget(
  resource: vscode.Uri | undefined
): Promise<DeployTarget | undefined> {
  if (resource) {
    const fromResource = await resolveDeployTargetFromResource(resource);

    if (fromResource) {
      return fromResource;
    }
  }

  const workspaceFolders = vscode.workspace.workspaceFolders ?? [];

  if (workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      "Abra um Liferay Workspace antes de executar o deploy."
    );
    return undefined;
  }

  return pickDeployTargetFromFolders(workspaceFolders);
}

async function resolveDeployTargetFromResource(
  resource: vscode.Uri
): Promise<DeployTarget | undefined> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

  if (!workspaceFolder) {
    return undefined;
  }

  const workspaceDir = workspaceFolder.uri.fsPath;
  const resourceDir = await toDirectoryPath(resource.fsPath);
  const workspaceRootType = getWorkspaceRootType(workspaceDir, resourceDir);

  if (!workspaceRootType) {
    return undefined;
  }

  let currentDir = resourceDir;

  while (isInsideOrEqual(workspaceDir, currentDir)) {
    const deployTarget = await buildDeployTarget(workspaceDir, currentDir);

    if (deployTarget) {
      return deployTarget;
    }

    if (pathEquals(currentDir, workspaceDir)) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  const matchingTargets = await findDeployTargets(workspaceDir, resourceDir);

  if (matchingTargets.length === 1) {
    return matchingTargets[0];
  }

  if (matchingTargets.length > 1) {
    return pickDeployTargetQuickPick(
      matchingTargets,
      `Escolha qual ${workspaceRootType.label} deseja publicar`
    );
  }

  vscode.window.showWarningMessage(
    `Nenhum ${workspaceRootType.label} deployavel foi encontrado em ${resourceDir}.`
  );

  return undefined;
}

async function pickDeployTargetFromFolders(
  workspaceFolders: readonly vscode.WorkspaceFolder[]
): Promise<DeployTarget | undefined> {
  const allTargets: DeployTarget[] = [];

  for (const workspaceFolder of workspaceFolders) {
    const workspaceDir = workspaceFolder.uri.fsPath;
    const rootDirs = [
      path.join(workspaceDir, CLIENT_EXTENSIONS_DIR),
      path.join(workspaceDir, "modules"),
      path.join(workspaceDir, "modulos")
    ];

    for (const rootDir of rootDirs) {
      if (await pathExists(rootDir)) {
        allTargets.push(...(await findDeployTargets(workspaceDir, rootDir)));
      }
    }
  }

  if (allTargets.length === 0) {
    vscode.window.showWarningMessage(
      "Nenhum projeto deployavel foi encontrado em client-extensions ou modules."
    );
    return undefined;
  }

  if (allTargets.length === 1) {
    return allTargets[0];
  }

  return pickDeployTargetQuickPick(
    allTargets,
    "Escolha o projeto que deseja publicar"
  );
}

async function findDeployTargets(
  workspaceDir: string,
  searchDir: string
): Promise<DeployTarget[]> {
  if (!getWorkspaceRootType(workspaceDir, searchDir)) {
    return [];
  }

  const deployTargets: DeployTarget[] = [];

  await visitDirectories(searchDir, async (dir) => {
    const deployTarget = await buildDeployTarget(workspaceDir, dir);

    if (deployTarget) {
      deployTargets.push(deployTarget);
      return false;
    }

    return true;
  });

  return dedupeDeployTargets(deployTargets);
}

async function buildDeployTarget(
  workspaceDir: string,
  projectDir: string
): Promise<DeployTarget | undefined> {
  const relativePath = path.relative(workspaceDir, projectDir);

  if (!relativePath || relativePath.startsWith("..")) {
    return undefined;
  }

  const relativeSegments = relativePath.split(path.sep).filter(Boolean);

  if (relativeSegments.length < 2) {
    return undefined;
  }

  const rootSegment = relativeSegments[0].toLowerCase();

  if (rootSegment === CLIENT_EXTENSIONS_DIR) {
    if (!(await pathExists(path.join(projectDir, "client-extension.yaml")))) {
      return undefined;
    }

    return {
      workspaceDir,
      projectDir,
      taskPath: toGradlePath(relativeSegments),
      displayName: relativeSegments[relativeSegments.length - 1],
      kind: "client-extension"
    };
  }

  if (MODULES_DIR_NAMES.has(rootSegment)) {
    const hasGradleBuild =
      (await pathExists(path.join(projectDir, "build.gradle"))) ||
      (await pathExists(path.join(projectDir, "build.gradle.kts")));

    if (!hasGradleBuild) {
      return undefined;
    }

    return {
      workspaceDir,
      projectDir,
      taskPath: toGradlePath(relativeSegments),
      displayName: relativeSegments[relativeSegments.length - 1],
      kind: "osgi-module"
    };
  }

  return undefined;
}

async function pickDeployTargetQuickPick(
  deployTargets: DeployTarget[],
  placeHolder: string
): Promise<DeployTarget | undefined> {
  const choice = await vscode.window.showQuickPick(
    deployTargets
      .slice()
      .sort((left, right) => left.taskPath.localeCompare(right.taskPath))
      .map((target) => ({
        label: target.displayName,
        description: `${getKindLabel(target.kind)} - ${target.taskPath}`,
        detail: target.projectDir,
        target
      })),
    {
      placeHolder
    }
  );

  return choice?.target;
}

async function visitDirectories(
  currentDir: string,
  visitor: (dir: string) => Promise<boolean>
): Promise<void> {
  const shouldContinue = await visitor(currentDir);

  if (!shouldContinue) {
    return;
  }

  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (IGNORED_DIR_NAMES.has(entry.name.toLowerCase())) {
      continue;
    }

    await visitDirectories(path.join(currentDir, entry.name), visitor);
  }
}

function dedupeDeployTargets(deployTargets: DeployTarget[]): DeployTarget[] {
  const seen = new Set<string>();
  const uniqueTargets: DeployTarget[] = [];

  for (const deployTarget of deployTargets) {
    const key = normalizePath(deployTarget.projectDir);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueTargets.push(deployTarget);
  }

  return uniqueTargets;
}

function getDeployLabel(target: DeployTarget): string {
  return `${getKindLabel(target.kind)} ${target.displayName}`;
}

function getKindLabel(kind: DeployTargetKind): string {
  return kind === "client-extension" ? "client extension" : "modulo OSGi";
}

function getWorkspaceRootType(
  workspaceDir: string,
  candidateDir: string
): { label: string } | undefined {
  const relativePath = path.relative(workspaceDir, candidateDir);

  if (!relativePath || relativePath.startsWith("..")) {
    return undefined;
  }

  const firstSegment = relativePath.split(path.sep).filter(Boolean)[0];
  const normalized = firstSegment?.toLowerCase();

  if (normalized === CLIENT_EXTENSIONS_DIR) {
    return { label: "client extension" };
  }

  if (normalized && MODULES_DIR_NAMES.has(normalized)) {
    return { label: "modulo OSGi" };
  }

  return undefined;
}

function mapGradleLineToDeployMessage(line: string): string {
  const normalized = line.toLowerCase();

  if (normalized.includes(":clean")) {
    return "Limpando artefatos anteriores...";
  }

  if (normalized.includes(":compilejava")) {
    return "Compilando codigo Java...";
  }

  if (normalized.includes(":jar")) {
    return "Gerando arquivo JAR...";
  }

  if (normalized.includes(":war")) {
    return "Gerando arquivo WAR...";
  }

  if (normalized.includes(":buildclientextension")) {
    return "Montando client extension...";
  }

  if (normalized.includes(":assemble")) {
    return "Empacotando artefatos...";
  }

  if (normalized.includes(":deploy")) {
    return "Enviando artefato para o bundle...";
  }

  if (normalized.includes("build successful")) {
    return "Build concluido com sucesso.";
  }

  if (normalized.includes("build failed")) {
    return "Build falhou.";
  }

  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
}

async function toDirectoryPath(targetPath: string): Promise<string> {
  try {
    const stats = await fs.stat(targetPath);

    return stats.isDirectory() ? targetPath : path.dirname(targetPath);
  } catch {
    return path.dirname(targetPath);
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toGradlePath(relativeSegments: string[]): string {
  return `:${relativeSegments.join(":")}`;
}

function isInsideOrEqual(parentDir: string, childDir: string): boolean {
  const relativePath = path.relative(parentDir, childDir);

  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function pathEquals(left: string, right: string): boolean {
  return normalizePath(left) === normalizePath(right);
}

function normalizePath(targetPath: string): string {
  return path.normalize(targetPath).toLowerCase();
}

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);

// src/commands/createWorkspace.ts
var path4 = __toESM(require("node:path"));
var vscode2 = __toESM(require("vscode"));

// src/core/versions.ts
var COMMUNITY_VERSIONS = [
  { label: "7.4 GA132", value: "portal-7.4-ga132" },
  { label: "7.4 GA129", value: "portal-7.4-ga129" }
];
var DXP_VERSIONS = [
  { label: "7.4 U102", value: "dxp-7.4-u102" },
  { label: "7.4 U98", value: "dxp-7.4-u98" }
];

// src/core/workspaceGenerator.ts
var fs2 = __toESM(require("node:fs/promises"));
var path2 = __toESM(require("node:path"));

// src/utils/fs.ts
var fs = __toESM(require("node:fs/promises"));
var path = __toESM(require("node:path"));
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// src/core/workspaceGenerator.ts
async function generateWorkspace(params) {
  const { context, workspaceDir, workspaceName, productVersion } = params;
  const templateDir = path2.join(
    context.extensionPath,
    "resources",
    "workspace-template"
  );
  const requiredFiles = [
    path2.join(templateDir, "gradlew"),
    path2.join(templateDir, "gradlew.bat"),
    path2.join(templateDir, "gradle", "wrapper", "gradle-wrapper.jar"),
    path2.join(templateDir, "gradle", "wrapper", "gradle-wrapper.properties")
  ];
  for (const file of requiredFiles) {
    try {
      await fs2.access(file);
    } catch {
      throw new Error(
        `Arquivo obrigat\xF3rio do Gradle Wrapper n\xE3o encontrado: ${file}`
      );
    }
  }
  await fs2.mkdir(workspaceDir, { recursive: true });
  await copyDir(templateDir, workspaceDir);
  const settingsGradle = `buildscript {
    repositories {
        mavenLocal()
        mavenCentral()
        maven {
            url "https://repository.liferay.com/nexus/content/groups/public"
        }
    }

    dependencies {
        classpath group: "com.liferay", name: "com.liferay.gradle.plugins.workspace", version: "latest.release"
    }
}

apply plugin: "com.liferay.workspace"

rootProject.name = "${workspaceName}"
`;
  const gradleProperties = `
liferay.workspace.bundle.dist.include.metadata=true
liferay.workspace.modules.dir=modules
liferay.workspace.themes.dir=themes
liferay.workspace.wars.dir=modules
microsoft.translator.subscription.key=
liferay.workspace.product=${productVersion}
target.platform.index.sources=false
`;
  const gitignore = `/bundles/
/.gradle/
/build/
/out/
/target/
node_modules/
.DS_Store
`;
  await fs2.writeFile(
    path2.join(workspaceDir, "settings.gradle"),
    settingsGradle,
    "utf8"
  );
  await fs2.writeFile(
    path2.join(workspaceDir, "gradle.properties"),
    gradleProperties,
    "utf8"
  );
  await fs2.writeFile(
    path2.join(workspaceDir, ".gitignore"),
    gitignore,
    "utf8"
  );
  await createWorkspaceDirectories(workspaceDir);
}
async function createWorkspaceDirectories(workspaceDir) {
  const directories = [
    "modules",
    "configs",
    "bundles",
    "client-extensions",
    "themes",
    "wars"
  ];
  for (const dir of directories) {
    await fs2.mkdir(path2.join(workspaceDir, dir), { recursive: true });
  }
  const configsDir = path2.join(workspaceDir, "configs", "local");
  await fs2.mkdir(configsDir, { recursive: true });
}

// src/core/gradleRunner.ts
var fs3 = __toESM(require("node:fs/promises"));
var path3 = __toESM(require("node:path"));
var import_node_child_process = require("node:child_process");

// src/core/output.ts
var vscode = __toESM(require("vscode"));
var liferayOutput = vscode.window.createOutputChannel(
  "Liferay Workspace"
);
function log(message) {
  liferayOutput.appendLine(message);
}

// src/core/gradleRunner.ts
async function runGradleCommand(workspaceDir, args, options = {}) {
  const { command, commandArgs } = await resolveGradleCommand(
    workspaceDir,
    args
  );
  await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(command, commandArgs, {
      cwd: workspaceDir,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let stderrOutput = "";
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      stdoutBuffer = flushLines(stdoutBuffer, (line) => {
        log(line);
        options.onLine?.(line);
      });
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderrBuffer += text;
      stderrOutput += text;
      stderrBuffer = flushLines(stderrBuffer, (line) => {
        log(line);
        options.onLine?.(line);
      });
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (stdoutBuffer.trim()) {
        log(stdoutBuffer.trim());
        options.onLine?.(stdoutBuffer.trim());
      }
      if (stderrBuffer.trim()) {
        log(stderrBuffer.trim());
        options.onLine?.(stderrBuffer.trim());
      }
      if (code === 0) {
        resolve();
        return;
      }
      const message = stderrOutput.trim() || `Gradle finalizou com c\xF3digo ${code}`;
      reject(new Error(message));
    });
  });
}
async function resolveGradleCommand(workspaceDir, args) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      commandArgs: ["/c", "gradlew.bat", ...args]
    };
  }
  const gradlewPath = path3.join(workspaceDir, "gradlew");
  await fs3.chmod(gradlewPath, 493);
  return {
    command: gradlewPath,
    commandArgs: args
  };
}
function flushLines(buffer, onLine) {
  const lines = buffer.split(/\r?\n/);
  const remaining = lines.pop() ?? "";
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    onLine(trimmedLine);
  }
  return remaining;
}

// src/core/javaValidator.ts
var import_node_child_process2 = require("node:child_process");
var import_node_util = require("node:util");
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process2.execFile);
async function validateJava() {
  try {
    await execFileAsync("java", ["-version"]);
  } catch {
    throw new Error(
      "Java n\xE3o encontrado. Instale JDK 17 e configure JAVA_HOME."
    );
  }
}

// src/commands/createWorkspace.ts
function registerCreateWorkspaceCommand(context) {
  const disposable = vscode2.commands.registerCommand(
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
        const workspaceName = await vscode2.window.showInputBox({
          prompt: "Nome do workspace",
          placeHolder: "ex: acme-liferay-workspace",
          validateInput: (value) => {
            if (!value.trim()) {
              return "Informe o nome do workspace";
            }
            if (/[\\/:\*\?"<>\|]/.test(value)) {
              return "O nome cont\xE9m caracteres inv\xE1lidos para pasta";
            }
            return void 0;
          }
        });
        if (!workspaceName) {
          return;
        }
        const selectedFolder = await vscode2.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Selecionar pasta destino"
        });
        if (!selectedFolder?.length) {
          return;
        }
        const baseDir = selectedFolder[0].fsPath;
        const workspaceDir = path4.join(baseDir, workspaceName);
        await vscode2.window.withProgress(
          {
            location: vscode2.ProgressLocation.Notification,
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
            await openWorkspace(workspaceDir);
          }
        );
        const openOption = "Abrir workspace";
        const choice = await vscode2.window.showInformationMessage(
          `Workspace criado com sucesso: ${workspaceDir}`,
          openOption
        );
        if (choice === openOption) {
          await openWorkspace(workspaceDir);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        vscode2.window.showErrorMessage(
          `Failed to create workspace: ${message}`
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}
async function pickEdition() {
  const choice = await vscode2.window.showQuickPick(
    [
      {
        label: "DXP",
        description: "Liferay DXP 7.4",
        value: "dxp"
      },
      {
        label: "Community",
        description: "Liferay Portal GA 7.4",
        value: "community"
      }
    ],
    {
      placeHolder: "Escolha a edi\xE7\xE3o do Liferay"
    }
  );
  return choice?.value;
}
async function pickProductVersion(edition) {
  const options = edition === "dxp" ? DXP_VERSIONS : COMMUNITY_VERSIONS;
  const choice = await vscode2.window.showQuickPick(
    options.map((option) => ({
      label: option.label,
      description: option.value,
      value: option.value
    })),
    {
      placeHolder: "Escolha a vers\xE3o do produto"
    }
  );
  return choice?.value;
}
async function openWorkspace(workspaceDir) {
  const workspaceUri = vscode2.Uri.file(workspaceDir);
  await vscode2.commands.executeCommand(
    "vscode.openFolder",
    workspaceUri,
    true
  );
}

// src/commands/downloadBundle.ts
var vscode3 = __toESM(require("vscode"));
function registerDownloadBundleCommand(context) {
  const disposable = vscode3.commands.registerCommand(
    "liferay.downloadBundle",
    async () => {
      try {
        const workspaceFolder = vscode3.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode3.window.showErrorMessage(
            "Abra um Liferay Workspace antes de baixar o bundle."
          );
          return;
        }
        const workspaceDir = workspaceFolder.uri.fsPath;
        let progressValue = 0;
        liferayOutput.show(true);
        await vscode3.window.withProgress(
          {
            location: vscode3.ProgressLocation.Notification,
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
        vscode3.window.showInformationMessage("Bundle baixado com sucesso.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        vscode3.window.showErrorMessage(
          `Falha ao baixar o bundle: ${message}`
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}
function mapGradleLineToMessage(line) {
  const normalized = line.toLowerCase();
  if (normalized.includes("downloading")) {
    return line;
  }
  if (normalized.includes("download")) {
    return line;
  }
  if (normalized.includes("extract")) {
    return "Extraindo bundle...";
  }
  if (normalized.includes("initbundle")) {
    return "Executando initBundle...";
  }
  if (normalized.includes("building")) {
    return "Processando tarefa Gradle...";
  }
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
}

// src/extension.ts
function activate(context) {
  registerCreateWorkspaceCommand(context);
  registerDownloadBundleCommand(context);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

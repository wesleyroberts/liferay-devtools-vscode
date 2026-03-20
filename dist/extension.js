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
    "client-extensions",
    "themes"
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
    if (shouldIgnoreGradleLine(trimmedLine)) {
      continue;
    }
    onLine(trimmedLine);
  }
  return remaining;
}
function shouldIgnoreGradleLine(line) {
  const normalized = line.toLowerCase();
  if (/^[a-z]:\\.*>/.test(normalized)) {
    return true;
  }
  if (normalized.startsWith("if ")) {
    return true;
  }
  if (normalized.startsWith("set ")) {
    return true;
  }
  if (normalized.startsWith("for %")) {
    return true;
  }
  if (normalized.includes(" endlocal")) {
    return true;
  }
  if (normalized.includes(" setlocal")) {
    return true;
  }
  return false;
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
        await vscode3.commands.executeCommand("liferay.managePortal");
        vscode3.window.showInformationMessage(
          "Bundle baixado com sucesso. O painel de controle do portal foi aberto."
        );
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

// src/commands/managePortal.ts
var vscode4 = __toESM(require("vscode"));
function registerManagePortalCommands(context, portalRuntime) {
  const panel = new PortalControlPanel(portalRuntime);
  context.subscriptions.push(
    panel,
    vscode4.commands.registerCommand("liferay.managePortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();
      if (!workspaceDir) {
        vscode4.window.showErrorMessage(
          "Abra um Liferay Workspace antes de gerenciar o portal."
        );
        return;
      }
      panel.show(workspaceDir);
    }),
    vscode4.commands.registerCommand("liferay.startPortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();
      if (!workspaceDir) {
        vscode4.window.showErrorMessage(
          "Abra um Liferay Workspace antes de iniciar o portal."
        );
        return;
      }
      panel.show(workspaceDir);
      await portalRuntime.start(workspaceDir);
    }),
    vscode4.commands.registerCommand("liferay.stopPortal", async () => {
      panel.show();
      await portalRuntime.stop();
    })
  );
}
function getCurrentWorkspaceDir() {
  return vscode4.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
var PortalControlPanel = class {
  constructor(portalRuntime) {
    this.portalRuntime = portalRuntime;
    this.disposables = [];
    this.disposables.push(
      portalRuntime.onDidChangeState((state) => {
        this.panel?.webview.postMessage({
          type: "state",
          payload: this.buildViewState(state)
        });
      })
    );
  }
  show(workspaceDir) {
    if (workspaceDir) {
      this.workspaceDir = workspaceDir;
    }
    if (!this.panel) {
      this.panel = vscode4.window.createWebviewPanel(
        "liferayPortalControl",
        "Liferay Portal Control",
        vscode4.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
      this.panel.webview.html = this.getHtml(this.panel.webview);
      this.panel.webview.onDidReceiveMessage(
        async (message) => {
          try {
            if (message.command === "start" && this.workspaceDir) {
              await this.portalRuntime.start(this.workspaceDir);
            }
            if (message.command === "stop") {
              await this.portalRuntime.stop();
            }
          } catch (error) {
            const text = error instanceof Error ? error.message : "Erro desconhecido";
            vscode4.window.showErrorMessage(text);
          }
        },
        void 0,
        this.disposables
      );
      this.panel.onDidDispose(() => {
        this.panel = void 0;
      }, void 0, this.disposables);
    }
    this.panel.reveal(vscode4.ViewColumn.Active, true);
    this.panel.webview.postMessage({
      type: "state",
      payload: this.buildViewState(this.portalRuntime.getState())
    });
  }
  dispose() {
    this.panel?.dispose();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
  getHtml(webview) {
    const nonce = getNonce();
    const initialState = JSON.stringify(
      this.buildViewState(this.portalRuntime.getState())
    );
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <title>Liferay Portal Control</title>
  <style>
    :root {
      color-scheme: dark;
      --panel: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98));
      --surface: rgba(15, 23, 42, 0.86);
      --border: rgba(148, 163, 184, 0.22);
      --text: #e5eefb;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --success: #22c55e;
      --warning: #f59e0b;
      --danger: #ef4444;
      --shadow: 0 24px 80px rgba(15, 23, 42, 0.45);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 38%),
        linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 1));
      color: var(--text);
      font-family: Consolas, "Courier New", monospace;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .shell {
      width: min(980px, 100%);
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 24px 28px 18px;
      border-bottom: 1px solid var(--border);
    }

    .title {
      display: grid;
      gap: 6px;
    }

    .eyebrow {
      color: var(--accent);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.1;
    }

    .subtitle {
      color: var(--muted);
      font-size: 13px;
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.65);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--muted);
      box-shadow: 0 0 18px currentColor;
    }

    .status-starting .status-dot,
    .status-stopping .status-dot {
      background: var(--warning);
      color: var(--warning);
    }

    .status-running .status-dot {
      background: var(--success);
      color: var(--success);
    }

    .status-error .status-dot {
      background: var(--danger);
      color: var(--danger);
    }

    .content {
      display: grid;
      gap: 18px;
      padding: 24px 28px 28px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    button {
      border: 0;
      border-radius: 12px;
      padding: 12px 16px;
      font: inherit;
      cursor: pointer;
      transition: transform 120ms ease, opacity 120ms ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
      transform: none;
    }

    .primary {
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      color: #082f49;
      font-weight: 700;
    }

    .danger {
      background: linear-gradient(135deg, #ef4444, #f87171);
      color: #fff1f2;
      font-weight: 700;
    }

    .meta {
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-size: 13px;
    }

    .meta strong {
      color: var(--text);
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="header">
      <div class="title">
        <div class="eyebrow">Portal Runtime</div>
        <h1>Start / Stop do Liferay</h1>
        <div class="subtitle">Controle o portal logo apos o download do bundle, com feedback continuo de execucao.</div>
      </div>
      <div id="status" class="status status-idle">
        <span class="status-dot"></span>
        <span id="status-label">idle</span>
      </div>
    </section>
    <section class="content">
      <div class="actions">
        <button id="start" class="primary">Start Portal</button>
        <button id="stop" class="danger">Stop Portal</button>
      </div>
      <div class="meta">
        <div><strong>Workspace:</strong> <span id="workspace">Aguardando workspace...</span></div>
        <div><strong>Bundle:</strong> <span id="bundle">Aguardando bundle...</span></div>
        <div><strong>PID:</strong> <span id="pid">-</span></div>
        <div><strong>Ultimo erro:</strong> <span id="error">Nenhum</span></div>
      </div>
    </section>
  </main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const state = ${initialState};

    const status = document.getElementById("status");
    const statusLabel = document.getElementById("status-label");
    const workspace = document.getElementById("workspace");
    const bundle = document.getElementById("bundle");
    const pid = document.getElementById("pid");
    const error = document.getElementById("error");
    const start = document.getElementById("start");
    const stop = document.getElementById("stop");

    start.addEventListener("click", () => vscode.postMessage({ command: "start" }));
    stop.addEventListener("click", () => vscode.postMessage({ command: "stop" }));

    function render(nextState) {
      status.className = "status status-" + nextState.status;
      statusLabel.textContent = nextState.status;
      workspace.textContent = nextState.workspaceDir || "Aguardando workspace...";
      bundle.textContent = nextState.portalDir || "Bundle ainda nao detectado.";
      pid.textContent = nextState.pid || "-";
      error.textContent = nextState.lastError || "Nenhum";
      start.disabled = nextState.status === "starting" || nextState.status === "running" || !nextState.workspaceDir;
      stop.disabled = nextState.status !== "running" && nextState.status !== "starting";
    }

    window.addEventListener("message", (event) => {
      if (event.data.type === "state") {
        render(event.data.payload);
      }
    });

    render(state);
  </script>
</body>
</html>`;
  }
  buildViewState(state) {
    if (!state.workspaceDir && this.workspaceDir) {
      return {
        ...state,
        workspaceDir: this.workspaceDir
      };
    }
    return state;
  }
};
function getNonce() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

// src/core/portalRuntime.ts
var fs4 = __toESM(require("node:fs/promises"));
var path5 = __toESM(require("node:path"));
var import_node_child_process3 = require("node:child_process");
var vscode5 = __toESM(require("vscode"));
var PortalRuntime = class {
  constructor() {
    this.state = {
      status: "idle",
      logs: []
    };
    this.onDidChangeStateEmitter = new vscode5.EventEmitter();
    this.onDidChangeState = this.onDidChangeStateEmitter.event;
  }
  getState() {
    return {
      ...this.state,
      logs: [...this.state.logs]
    };
  }
  async start(workspaceDir) {
    if (this.state.status === "starting" || this.state.status === "running") {
      return;
    }
    await validateJava();
    const portalDir = await findPortalDir(workspaceDir);
    const command = buildPortalCommand(portalDir, "run");
    this.appendLog(`Iniciando portal em ${portalDir}`);
    this.updateState({
      status: "starting",
      workspaceDir,
      portalDir,
      lastError: void 0
    });
    await new Promise((resolve, reject) => {
      const child = (0, import_node_child_process3.spawn)(command.command, command.args, {
        cwd: command.cwd,
        stdio: ["ignore", "pipe", "pipe"]
      });
      let stdoutBuffer = "";
      let stderrBuffer = "";
      let resolved = false;
      this.child = child;
      this.updateState({ pid: child.pid });
      const settleStarted = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      child.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk.toString();
        stdoutBuffer = this.flushLines(stdoutBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });
      child.stderr.on("data", (chunk) => {
        stderrBuffer += chunk.toString();
        stderrBuffer = this.flushLines(stderrBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });
      child.on("error", (error) => {
        this.child = void 0;
        this.updateState({
          status: "error",
          pid: void 0,
          lastError: error.message
        });
        reject(error);
      });
      child.on("close", (code) => {
        this.child = void 0;
        if (stdoutBuffer.trim()) {
          this.handlePortalLine(stdoutBuffer.trim());
        }
        if (stderrBuffer.trim()) {
          this.handlePortalLine(stderrBuffer.trim());
        }
        const expectedStop = this.state.status === "stopping";
        if (expectedStop) {
          this.appendLog("Portal finalizado.");
          this.updateState({
            status: "idle",
            pid: void 0,
            lastError: void 0
          });
          settleStarted();
          return;
        }
        const message = code === 0 ? "Portal finalizado." : `Portal finalizou com codigo ${code ?? "desconhecido"}.`;
        this.appendLog(message);
        this.updateState({
          status: code === 0 ? "idle" : "error",
          pid: void 0,
          lastError: code === 0 ? void 0 : message
        });
        if (!resolved && code !== 0) {
          reject(new Error(message));
          return;
        }
        settleStarted();
      });
    });
  }
  async stop() {
    if (!this.child || this.state.status === "idle" || this.state.status === "stopping") {
      return;
    }
    const { portalDir } = this.state;
    if (!portalDir) {
      throw new Error("Diretorio do portal nao encontrado para parar o processo.");
    }
    this.appendLog("Parando portal...");
    this.updateState({
      status: "stopping",
      lastError: void 0
    });
    await stopPortalProcess(this.child.pid, portalDir);
  }
  dispose() {
    this.onDidChangeStateEmitter.dispose();
  }
  handlePortalLine(line) {
    log(line);
    this.appendLog(line);
    const normalized = line.toLowerCase();
    if (this.state.status === "starting" && (normalized.includes("server startup in") || normalized.includes("startup completed") || normalized.includes("liferay home"))) {
      this.updateState({
        status: "running"
      });
    }
    if (normalized.includes("severe") || normalized.includes("exception") || normalized.includes("address already in use")) {
      this.updateState({
        lastError: line
      });
    }
  }
  appendLog(message) {
    const logs = [...this.state.logs, message].slice(-400);
    this.updateState({ logs });
  }
  updateState(patch) {
    this.state = {
      ...this.state,
      ...patch
    };
    this.onDidChangeStateEmitter.fire(this.getState());
  }
  flushLines(buffer, onLine) {
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
};
async function findPortalDir(workspaceDir) {
  const bundlesDir = path5.join(workspaceDir, "bundles");
  let entries;
  try {
    entries = await fs4.readdir(bundlesDir, { withFileTypes: true });
  } catch {
    throw new Error("A pasta bundles nao foi encontrada. Execute o download do bundle primeiro.");
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const portalDir = path5.join(bundlesDir, entry.name);
    const catalinaBat = path5.join(portalDir, "bin", "catalina.bat");
    const catalinaSh = path5.join(portalDir, "bin", "catalina.sh");
    if (await exists(catalinaBat) || await exists(catalinaSh)) {
      return portalDir;
    }
  }
  throw new Error(
    "Nenhum bundle Tomcat valido foi encontrado em bundles/. Verifique se o initBundle terminou corretamente."
  );
}
function buildPortalCommand(portalDir, action) {
  const binDir = path5.join(portalDir, "bin");
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/c", "catalina.bat", action],
      cwd: binDir
    };
  }
  return {
    command: path5.join(binDir, "catalina.sh"),
    args: [action],
    cwd: binDir
  };
}
async function stopPortalProcess(pid, portalDir) {
  const stopCommand = buildPortalCommand(portalDir, "stop");
  await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process3.spawn)(stopCommand.command, stopCommand.args, {
      cwd: stopCommand.cwd,
      stdio: "ignore"
    });
    child.on("error", reject);
    child.on("close", () => resolve());
  });
  if (!pid) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  if (process.platform === "win32") {
    await new Promise((resolve, reject) => {
      const killer = (0, import_node_child_process3.spawn)("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore"
      });
      killer.on("error", reject);
      killer.on("close", () => resolve());
    });
    return;
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch {
  }
}
async function exists(filePath) {
  try {
    await fs4.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// src/extension.ts
function activate(context) {
  const portalRuntime = new PortalRuntime();
  registerCreateWorkspaceCommand(context);
  registerDownloadBundleCommand(context);
  registerManagePortalCommands(context, portalRuntime);
  context.subscriptions.push(portalRuntime);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

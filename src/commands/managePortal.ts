import * as vscode from "vscode";
import { PortalRuntime } from "../core/portalRuntime";

export function registerManagePortalCommands(
  context: vscode.ExtensionContext,
  portalRuntime: PortalRuntime
) {
  const panel = new PortalControlPanel(portalRuntime);

  context.subscriptions.push(
    panel,
    vscode.commands.registerCommand("liferay.managePortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();

      if (!workspaceDir) {
        vscode.window.showErrorMessage(
          "Abra um Liferay Workspace antes de gerenciar o portal."
        );
        return;
      }

      panel.show(workspaceDir);
    }),
    vscode.commands.registerCommand("liferay.startPortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();

      if (!workspaceDir) {
        vscode.window.showErrorMessage(
          "Abra um Liferay Workspace antes de iniciar o portal."
        );
        return;
      }

      panel.show(workspaceDir);
      await portalRuntime.start(workspaceDir);
    }),
    vscode.commands.registerCommand("liferay.stopPortal", async () => {
      panel.show();
      await portalRuntime.stop();
    })
  );
}

function getCurrentWorkspaceDir(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

class PortalControlPanel implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private workspaceDir: string | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly portalRuntime: PortalRuntime) {
    this.disposables.push(
      portalRuntime.onDidChangeState((state) => {
        this.panel?.webview.postMessage({
          type: "state",
          payload: this.buildViewState(state)
        });
      })
    );
  }

  public show(workspaceDir?: string) {
    if (workspaceDir) {
      this.workspaceDir = workspaceDir;
    }

    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "liferayPortalControl",
        "Liferay Portal Control",
        vscode.ViewColumn.Active,
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
            const text =
              error instanceof Error ? error.message : "Erro desconhecido";

            vscode.window.showErrorMessage(text);
          }
        },
        undefined,
        this.disposables
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
      }, undefined, this.disposables);
    }

    this.panel.reveal(vscode.ViewColumn.Active, true);
    this.panel.webview.postMessage({
      type: "state",
      payload: this.buildViewState(this.portalRuntime.getState())
    });
  }

  public dispose() {
    this.panel?.dispose();

    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private getHtml(webview: vscode.Webview): string {
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

  private buildViewState(state: ReturnType<PortalRuntime["getState"]>) {
    if (!state.workspaceDir && this.workspaceDir) {
      return {
        ...state,
        workspaceDir: this.workspaceDir
      };
    }

    return state;
  }
}

function getNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";

  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return value;
}

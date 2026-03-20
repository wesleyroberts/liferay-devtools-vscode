import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import * as vscode from "vscode";
import { validateJava } from "./javaValidator";
import { log } from "./output";

type PortalStatus = "idle" | "starting" | "running" | "stopping" | "error";

export interface PortalRuntimeState {
  status: PortalStatus;
  workspaceDir?: string;
  portalDir?: string;
  logs: string[];
  pid?: number;
  lastError?: string;
}

interface PortalCommand {
  command: string;
  args: string[];
  cwd: string;
}

export class PortalRuntime implements vscode.Disposable {
  private child: ChildProcessWithoutNullStreams | undefined;
  private state: PortalRuntimeState = {
    status: "idle",
    logs: []
  };
  private readonly onDidChangeStateEmitter =
    new vscode.EventEmitter<PortalRuntimeState>();

  public readonly onDidChangeState = this.onDidChangeStateEmitter.event;

  public getState(): PortalRuntimeState {
    return {
      ...this.state,
      logs: [...this.state.logs]
    };
  }

  public async start(workspaceDir: string): Promise<void> {
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
      lastError: undefined
    });

    await new Promise<void>((resolve, reject) => {
      const child = spawn(command.command, command.args, {
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

      child.stdout.on("data", (chunk: Buffer | string) => {
        stdoutBuffer += chunk.toString();
        stdoutBuffer = this.flushLines(stdoutBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });

      child.stderr.on("data", (chunk: Buffer | string) => {
        stderrBuffer += chunk.toString();
        stderrBuffer = this.flushLines(stderrBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });

      child.on("error", (error) => {
        this.child = undefined;
        this.updateState({
          status: "error",
          pid: undefined,
          lastError: error.message
        });
        reject(error);
      });

      child.on("close", (code) => {
        this.child = undefined;

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
            pid: undefined,
            lastError: undefined
          });
          settleStarted();
          return;
        }

        const message =
          code === 0
            ? "Portal finalizado."
            : `Portal finalizou com codigo ${code ?? "desconhecido"}.`;

        this.appendLog(message);
        this.updateState({
          status: code === 0 ? "idle" : "error",
          pid: undefined,
          lastError: code === 0 ? undefined : message
        });

        if (!resolved && code !== 0) {
          reject(new Error(message));
          return;
        }

        settleStarted();
      });
    });
  }

  public async stop(): Promise<void> {
    if (
      !this.child ||
      this.state.status === "idle" ||
      this.state.status === "stopping"
    ) {
      return;
    }

    const { portalDir } = this.state;

    if (!portalDir) {
      throw new Error("Diretorio do portal nao encontrado para parar o processo.");
    }

    this.appendLog("Parando portal...");
    this.updateState({
      status: "stopping",
      lastError: undefined
    });

    await stopPortalProcess(this.child.pid, portalDir);
  }

  public dispose() {
    this.onDidChangeStateEmitter.dispose();
  }

  private handlePortalLine(line: string) {
    log(line);
    this.appendLog(line);

    const normalized = line.toLowerCase();

    if (
      this.state.status === "starting" &&
      (normalized.includes("server startup in") ||
        normalized.includes("startup completed") ||
        normalized.includes("liferay home"))
    ) {
      this.updateState({
        status: "running"
      });
    }

    if (
      normalized.includes("severe") ||
      normalized.includes("exception") ||
      normalized.includes("address already in use")
    ) {
      this.updateState({
        lastError: line
      });
    }
  }

  private appendLog(message: string) {
    const logs = [...this.state.logs, message].slice(-400);
    this.updateState({ logs });
  }

  private updateState(patch: Partial<PortalRuntimeState>) {
    this.state = {
      ...this.state,
      ...patch
    };

    this.onDidChangeStateEmitter.fire(this.getState());
  }

  private flushLines(buffer: string, onLine: (line: string) => void): string {
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
}

async function findPortalDir(workspaceDir: string): Promise<string> {
  const bundlesDir = path.join(workspaceDir, "bundles");

  let entries;

  try {
    entries = await fs.readdir(bundlesDir, { withFileTypes: true });
  } catch {
    throw new Error("A pasta bundles nao foi encontrada. Execute o download do bundle primeiro.");
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const portalDir = path.join(bundlesDir, entry.name);
    const catalinaBat = path.join(portalDir, "bin", "catalina.bat");
    const catalinaSh = path.join(portalDir, "bin", "catalina.sh");

    if ((await exists(catalinaBat)) || (await exists(catalinaSh))) {
      return portalDir;
    }
  }

  throw new Error(
    "Nenhum bundle Tomcat valido foi encontrado em bundles/. Verifique se o initBundle terminou corretamente."
  );
}

function buildPortalCommand(
  portalDir: string,
  action: "run" | "stop"
): PortalCommand {
  const binDir = path.join(portalDir, "bin");

  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/c", "catalina.bat", action],
      cwd: binDir
    };
  }

  return {
    command: path.join(binDir, "catalina.sh"),
    args: [action],
    cwd: binDir
  };
}

async function stopPortalProcess(
  pid: number | undefined,
  portalDir: string
): Promise<void> {
  const stopCommand = buildPortalCommand(portalDir, "stop");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(stopCommand.command, stopCommand.args, {
      cwd: stopCommand.cwd,
      stdio: "ignore"
    });

    child.on("error", reject);
    child.on("close", () => resolve());
  });

  if (!pid) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));

  if (process.platform === "win32") {
    await new Promise<void>((resolve, reject) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
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
    // Processo ja terminou, nao ha nada para fazer.
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

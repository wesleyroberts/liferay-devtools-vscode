import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { log } from "./output";

export interface RunGradleCommandOptions {
  onLine?: (line: string) => void;
}

export async function runGradleCommand(
  workspaceDir: string,
  args: string[],
  options: RunGradleCommandOptions = {}
): Promise<void> {
  const { command, commandArgs } = await resolveGradleCommand(
    workspaceDir,
    args
  );

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: workspaceDir,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";
    let stderrOutput = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdoutBuffer += chunk.toString();
      stdoutBuffer = flushLines(stdoutBuffer, (line) => {
        log(line);
        options.onLine?.(line);
      });
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
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

      const message = stderrOutput.trim() || `Gradle finalizou com código ${code}`;
      reject(new Error(message));
    });
  });
}

async function resolveGradleCommand(
  workspaceDir: string,
  args: string[]
): Promise<{ command: string; commandArgs: string[] }> {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      commandArgs: ["/c", "gradlew.bat", ...args]
    };
  }

  const gradlewPath = path.join(workspaceDir, "gradlew");
  await fs.chmod(gradlewPath, 0o755);

  return {
    command: gradlewPath,
    commandArgs: args
  };
}

function flushLines(
  buffer: string,
  onLine: (line: string) => void
): string {
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

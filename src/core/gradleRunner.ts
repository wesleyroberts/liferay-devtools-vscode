import * as fs from "node:fs/promises";
import * as path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runGradleTasks(workspaceDir: string): Promise<void> {
  try {
    if (process.platform === "win32") {
      const { stdout, stderr } = await execAsync("gradlew.bat tasks", {
        cwd: workspaceDir
      });

      console.log(stdout);
      console.error(stderr);
      return;
    }

    const gradlewPath = path.join(workspaceDir, "gradlew");
    await fs.chmod(gradlewPath, 0o755);

    const { stdout, stderr } = await execAsync(`"${gradlewPath}" tasks`, {
      cwd: workspaceDir
    });

    console.log(stdout);
    console.error(stderr);
  } catch (error: any) {
    const stdout = error?.stdout ?? "";
    const stderr = error?.stderr ?? "";
    const message = error?.message ?? "Erro ao executar Gradle";

    throw new Error(
      `${message}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
    );
  }
}

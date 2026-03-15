import * as fs from "node:fs/promises";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runGradleCommand(
  workspaceDir: string,
  args: string[]
): Promise<void> {
  if (process.platform === "win32") {
    await execFileAsync("cmd.exe", ["/c", "gradlew.bat", ...args], {
      cwd: workspaceDir
    });
    return;
  }

  const gradlewPath = path.join(workspaceDir, "gradlew");
  await fs.chmod(gradlewPath, 0o755);

  await execFileAsync(gradlewPath, args, {
    cwd: workspaceDir
  });
}

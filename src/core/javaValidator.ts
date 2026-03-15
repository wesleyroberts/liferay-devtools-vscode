import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function validateJava(): Promise<void> {
  try {
    await execFileAsync("java", ["-version"]);
  } catch {
    throw new Error(
      "Java não encontrado. Instale JDK 17 e configure JAVA_HOME."
    );
  }
}

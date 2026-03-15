import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { copyDir } from "../utils/fs";

export interface GenerateWorkspaceParams {
  context: vscode.ExtensionContext;
  workspaceDir: string;
  workspaceName: string;
  productVersion: string;
}

export async function generateWorkspace(
  params: GenerateWorkspaceParams
): Promise<void> {
  const { context, workspaceDir, workspaceName, productVersion } = params;

  const templateDir = path.join(
    context.extensionPath,
    "resources",
    "workspace-template"
  );

  const requiredFiles = [
    path.join(templateDir, "gradlew"),
    path.join(templateDir, "gradlew.bat"),
    path.join(templateDir, "gradle", "wrapper", "gradle-wrapper.jar"),
    path.join(templateDir, "gradle", "wrapper", "gradle-wrapper.properties")
  ];

  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch {
      throw new Error(
        `Arquivo obrigatório do Gradle Wrapper não encontrado: ${file}`
      );
    }
  }

  await fs.mkdir(workspaceDir, { recursive: true });
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

  await fs.writeFile(
    path.join(workspaceDir, "settings.gradle"),
    settingsGradle,
    "utf8"
  );

  await fs.writeFile(
    path.join(workspaceDir, "gradle.properties"),
    gradleProperties,
    "utf8"
  );

  await fs.writeFile(
    path.join(workspaceDir, ".gitignore"),
    gitignore,
    "utf8"
  );

  await createWorkspaceDirectories(workspaceDir);
}

async function createWorkspaceDirectories(workspaceDir: string): Promise<void> {
  const directories = [
    "modules",
    "configs",
    "client-extensions",
    "themes",
  ];

  for (const dir of directories) {
    await fs.mkdir(path.join(workspaceDir, dir), { recursive: true });
  }

   const configsDir = path.join(workspaceDir, "configs", "local");

  await fs.mkdir(configsDir, { recursive: true });
}

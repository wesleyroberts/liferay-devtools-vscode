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

export async function generateWorkspace(params: GenerateWorkspaceParams): Promise<void> {
  const { context, workspaceDir, workspaceName, productVersion } = params;

  const templateDir = path.join(
    context.extensionPath,
    "resources",
    "workspace-template"
  );

  try {
    await fs.access(templateDir);
  } catch {
    throw new Error(
      `Template não encontrado em: ${templateDir}. Crie a pasta resources/workspace-template com os arquivos do Gradle Wrapper.`
    );
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

  const gradleProperties = `liferay.workspace.product=${productVersion}
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
}

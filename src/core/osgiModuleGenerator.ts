import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

export type OsgiModuleTemplateId =
  | "mvc-portlet"
  | "api-service"
  | "portlet-react";

export interface OsgiModuleTemplate {
  id: OsgiModuleTemplateId;
  label: string;
  description: string;
  detail: string;
}

export interface GenerateOsgiModuleParams {
  context: vscode.ExtensionContext;
  modulesDir: string;
  projectName: string;
  templateId: OsgiModuleTemplateId;
}

export const OSGI_MODULE_TEMPLATES: OsgiModuleTemplate[] = [
  {
    id: "mvc-portlet",
    label: "MVC Portlet",
    description: "Portlet Java tradicional com JSP",
    detail: "Starter OSGi com MVCPortlet, view.jsp e configuracao Gradle"
  },
  {
    id: "api-service",
    label: "API + Service",
    description: "Modulo OSGi dividido em API e implementacao de servico",
    detail: "Cria submodulos -api e -service para backend modular"
  },
  {
    id: "portlet-react",
    label: "Portlet React",
    description: "Portlet OSGi com interface React",
    detail: "Sample com MVCPortlet, JSP e renderizacao React via Liferay.Loader"
  }
];

export function getOsgiModuleTemplate(
  templateId: OsgiModuleTemplateId
): OsgiModuleTemplate {
  const template = OSGI_MODULE_TEMPLATES.find((item) => item.id === templateId);

  if (!template) {
    throw new Error(`Template OSGi invalido: ${templateId}`);
  }

  return template;
}

export async function generateOsgiModule(
  params: GenerateOsgiModuleParams
): Promise<void> {
  const { context, modulesDir, projectName, templateId } = params;
  const templateDir = path.join(
    context.extensionPath,
    "resources",
    "osgi-module-templates",
    templateId
  );
  const projectDir = path.join(modulesDir, projectName);

  await assertPathExists(templateDir, "Template interno nao encontrado");
  await assertPathDoesNotExist(
    projectDir,
    "Ja existe um modulo OSGi com esse nome"
  );

  const replacements = buildTemplateReplacements(projectName);

  await copyTemplateDir(templateDir, projectDir, replacements);
}

async function assertPathExists(filePath: string, message: string) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`${message}: ${filePath}`);
  }
}

async function assertPathDoesNotExist(filePath: string, message: string) {
  try {
    await fs.access(filePath);
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      throw error;
    }
  }
}

async function copyTemplateDir(
  src: string,
  dest: string,
  replacements: Record<string, string>
): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const nextName = applyReplacements(entry.name, replacements);
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, nextName);

    if (entry.isDirectory()) {
      await copyTemplateDir(srcPath, destPath, replacements);
      continue;
    }

    const content = await fs.readFile(srcPath, "utf8");

    await fs.writeFile(destPath, applyReplacements(content, replacements), "utf8");
  }
}

function applyReplacements(
  content: string,
  replacements: Record<string, string>
): string {
  return Object.entries(replacements).reduce((result, [token, value]) => {
    return result.split(token).join(value);
  }, content);
}

function buildTemplateReplacements(
  projectName: string
): Record<string, string> {
  const projectTitle = projectName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const packageSuffix = projectName.replace(/-/g, ".").toLowerCase();
  const packageName = `com.acme.${packageSuffix}`;
  const packagePath = packageName.replace(/\./g, "/");
  const classPrefix = projectName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return {
    "__PROJECT_NAME__": projectName,
    "__PROJECT_TITLE__": projectTitle,
    "__PACKAGE_NAME__": packageName,
    "__PACKAGE_PATH__": packagePath,
    "__CLASS_PREFIX__": classPrefix
  };
}

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

export type ClientExtensionTemplateId =
  | "custom-element"
  | "custom-element-react-vite"
  | "custom-element-svelte"
  | "custom-element-vue"
  | "custom-element-angular"
  | "global-js"
  | "global-js-instance"
  | "global-css"
  | "global-css-company"
  | "global-css-page"
  | "iframe"
  | "site-initializer"
  | "batch"
  | "etc-bun"
  | "etc-cron"
  | "etc-golang"
  | "etc-java-quarkus"
  | "etc-node"
  | "etc-python-fastapi"
  | "etc-spring-boot";

export interface ClientExtensionTemplate {
  id: ClientExtensionTemplateId;
  label: string;
  description: string;
  detail: string;
}

export interface GenerateClientExtensionParams {
  context: vscode.ExtensionContext;
  clientExtensionsDir: string;
  projectName: string;
  templateId: ClientExtensionTemplateId;
}

export const CLIENT_EXTENSION_TEMPLATES: ClientExtensionTemplate[] = [
  {
    id: "custom-element",
    label: "Custom Element",
    description: "Widget frontend com HTML, CSS e JavaScript",
    detail: "Baseado nos samples de custom element, com assets locais"
  },
  {
    id: "custom-element-react-vite",
    label: "Custom Element React Vite",
    description: "Starter React com Vite para custom element",
    detail: "Inspirado no liferay-sample-custom-element-react-vite"
  },
  {
    id: "custom-element-svelte",
    label: "Custom Element Svelte",
    description: "Starter Svelte com Vite para custom element",
    detail: "Baseado no sample-custom-element-svelte"
  },
  {
    id: "custom-element-vue",
    label: "Custom Element Vue",
    description: "Starter Vue com Vite para custom element",
    detail: "Baseado no sample-custom-element-vue"
  },
  {
    id: "custom-element-angular",
    label: "Custom Element Angular",
    description: "Starter Angular para custom element",
    detail: "Inspirado no liferay-sample-custom-element-angular"
  },
  {
    id: "global-js",
    label: "Global JS",
    description: "JavaScript executado nas paginas do portal",
    detail: "Estrutura simples com arquivo global.js e assemble"
  },
  {
    id: "global-js-instance",
    label: "Global JS Instance",
    description: "JavaScript global para toda a instancia",
    detail: "Usa scope company e scriptLocation head"
  },
  {
    id: "global-css",
    label: "Global CSS",
    description: "CSS global para paginas do portal",
    detail: "Estrutura simples com arquivo global.css e assemble"
  },
  {
    id: "global-css-company",
    label: "Global CSS Company",
    description: "CSS aplicado automaticamente em toda a instancia",
    detail: "Usa scope company como nos samples company scoped"
  },
  {
    id: "global-css-page",
    label: "Global CSS Page",
    description: "CSS para habilitar em paginas especificas",
    detail: "Template page scoped semelhante ao sample page"
  },
  {
    id: "iframe",
    label: "IFrame",
    description: "Widget que incorpora uma URL externa",
    detail: "Template minimo para apontar para uma aplicacao hospedada"
  },
  {
    id: "site-initializer",
    label: "Site Initializer",
    description: "Base para empacotar conteudo inicial de site",
    detail: "Inspirado no liferay-sample-site-initializer"
  },
  {
    id: "batch",
    label: "Batch",
    description: "Base para importar dados via Batch Engine",
    detail: "Inspirado no liferay-sample-batch"
  },
  {
    id: "etc-bun",
    label: "ETC Bun",
    description: "Microservico Bun para object actions",
    detail: "Baseado no sample-etc-bun"
  },
  {
    id: "etc-cron",
    label: "ETC Cron",
    description: "Microservico Spring Boot com rotina agendada",
    detail: "Inspirado no liferay-sample-etc-cron"
  },
  {
    id: "etc-golang",
    label: "ETC Golang",
    description: "Microservico Go para object actions",
    detail: "Baseado no sample-etc-golang"
  },
  {
    id: "etc-java-quarkus",
    label: "ETC Java Quarkus",
    description: "Microservico Quarkus para object actions",
    detail: "Baseado no sample-etc-java-quarkus"
  },
  {
    id: "etc-node",
    label: "ETC Node",
    description: "Microservico Node.js para integracoes",
    detail: "Inspirado no liferay-sample-etc-node"
  },
  {
    id: "etc-python-fastapi",
    label: "ETC Python FastAPI",
    description: "Microservico FastAPI para object actions",
    detail: "Baseado no sample-etc-python-fastapi"
  },
  {
    id: "etc-spring-boot",
    label: "ETC Spring Boot",
    description: "Microservico Spring Boot para integracoes",
    detail: "Inspirado no liferay-sample-etc-spring-boot"
  }
];

export function getClientExtensionTemplate(
  templateId: ClientExtensionTemplateId
): ClientExtensionTemplate {
  const template = CLIENT_EXTENSION_TEMPLATES.find(
    (item) => item.id === templateId
  );

  if (!template) {
    throw new Error(`Template de client extension invalido: ${templateId}`);
  }

  return template;
}

export async function generateClientExtension(
  params: GenerateClientExtensionParams
): Promise<void> {
  const { context, clientExtensionsDir, projectName, templateId } = params;

  const templateDir = path.join(
    context.extensionPath,
    "resources",
    "client-extension-templates",
    templateId
  );

  const projectDir = path.join(clientExtensionsDir, projectName);

  await assertPathExists(templateDir, "Template interno nao encontrado");
  await assertPathDoesNotExist(
    projectDir,
    "Ja existe uma client extension com esse nome"
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
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

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

  const customElementTag = projectName.includes("-")
    ? projectName
    : `${projectName}-element`;

  return {
    "__PROJECT_ID__": projectName,
    "__PROJECT_NAME__": projectName,
    "__PROJECT_TITLE__": projectTitle,
    "__CUSTOM_ELEMENT_TAG__": customElementTag,
    "__FRIENDLY_URL_MAPPING__": projectName
  };
}

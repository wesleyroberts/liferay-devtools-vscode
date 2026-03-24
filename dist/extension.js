"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);

// src/commands/createClientExtension.ts
var fs2 = __toESM(require("node:fs/promises"));
var path2 = __toESM(require("node:path"));
var vscode = __toESM(require("vscode"));

// src/core/clientExtensionGenerator.ts
var fs = __toESM(require("node:fs/promises"));
var path = __toESM(require("node:path"));
var CLIENT_EXTENSION_TEMPLATES = [
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
function getClientExtensionTemplate(templateId) {
  const template = CLIENT_EXTENSION_TEMPLATES.find(
    (item) => item.id === templateId
  );
  if (!template) {
    throw new Error(`Template de client extension invalido: ${templateId}`);
  }
  return template;
}
async function generateClientExtension(params) {
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
async function assertPathExists(filePath, message) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`${message}: ${filePath}`);
  }
}
async function assertPathDoesNotExist(filePath, message) {
  try {
    await fs.access(filePath);
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      throw error;
    }
  }
}
async function copyTemplateDir(src, dest, replacements) {
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
function applyReplacements(content, replacements) {
  return Object.entries(replacements).reduce((result, [token, value]) => {
    return result.split(token).join(value);
  }, content);
}
function buildTemplateReplacements(projectName) {
  const projectTitle = projectName.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const customElementTag = projectName.includes("-") ? projectName : `${projectName}-element`;
  return {
    "__PROJECT_ID__": projectName,
    "__PROJECT_NAME__": projectName,
    "__PROJECT_TITLE__": projectTitle,
    "__CUSTOM_ELEMENT_TAG__": customElementTag,
    "__FRIENDLY_URL_MAPPING__": projectName
  };
}

// src/commands/createClientExtension.ts
function registerCreateClientExtensionCommands(context) {
  const commandConfigs = [
    {
      command: "liferay.createClientExtension"
    },
    {
      command: "liferay.createClientExtension.customElement",
      templateId: "custom-element"
    },
    {
      command: "liferay.createClientExtension.customElementReactVite",
      templateId: "custom-element-react-vite"
    },
    {
      command: "liferay.createClientExtension.customElementSvelte",
      templateId: "custom-element-svelte"
    },
    {
      command: "liferay.createClientExtension.customElementVue",
      templateId: "custom-element-vue"
    },
    {
      command: "liferay.createClientExtension.customElementAngular",
      templateId: "custom-element-angular"
    },
    {
      command: "liferay.createClientExtension.globalJS",
      templateId: "global-js"
    },
    {
      command: "liferay.createClientExtension.globalJSInstance",
      templateId: "global-js-instance"
    },
    {
      command: "liferay.createClientExtension.globalCSS",
      templateId: "global-css"
    },
    {
      command: "liferay.createClientExtension.globalCSSCompany",
      templateId: "global-css-company"
    },
    {
      command: "liferay.createClientExtension.globalCSSPage",
      templateId: "global-css-page"
    },
    {
      command: "liferay.createClientExtension.iframe",
      templateId: "iframe"
    },
    {
      command: "liferay.createClientExtension.siteInitializer",
      templateId: "site-initializer"
    },
    {
      command: "liferay.createClientExtension.batch",
      templateId: "batch"
    },
    {
      command: "liferay.createClientExtension.etcBun",
      templateId: "etc-bun"
    },
    {
      command: "liferay.createClientExtension.etcCron",
      templateId: "etc-cron"
    },
    {
      command: "liferay.createClientExtension.etcGolang",
      templateId: "etc-golang"
    },
    {
      command: "liferay.createClientExtension.etcJavaQuarkus",
      templateId: "etc-java-quarkus"
    },
    {
      command: "liferay.createClientExtension.etcNode",
      templateId: "etc-node"
    },
    {
      command: "liferay.createClientExtension.etcPythonFastAPI",
      templateId: "etc-python-fastapi"
    },
    {
      command: "liferay.createClientExtension.etcSpringBoot",
      templateId: "etc-spring-boot"
    }
  ];
  for (const config of commandConfigs) {
    const disposable = vscode.commands.registerCommand(
      config.command,
      async (resource) => {
        await runCreateClientExtensionFlow(context, resource, config.templateId);
      }
    );
    context.subscriptions.push(disposable);
  }
}
async function runCreateClientExtensionFlow(context, resource, initialTemplateId) {
  try {
    const clientExtensionsDir = await resolveClientExtensionsDir(resource);
    if (!clientExtensionsDir) {
      return;
    }
    const templateId = initialTemplateId ?? await pickTemplateId();
    if (!templateId) {
      return;
    }
    const template = getClientExtensionTemplate(templateId);
    const projectName = await vscode.window.showInputBox({
      prompt: `Nome da pasta para ${template.label}`,
      placeHolder: "ex: acme-global-js",
      validateInput: validateProjectName
    });
    if (!projectName) {
      return;
    }
    const projectDir = path2.join(clientExtensionsDir, projectName);
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Criando client extension ${projectName}...`,
        cancellable: false
      },
      async () => {
        await generateClientExtension({
          context,
          clientExtensionsDir,
          projectName,
          templateId
        });
      }
    );
    const openOption = "Abrir pasta";
    const revealOption = "Revelar no Explorer";
    const choice = await vscode.window.showInformationMessage(
      `Client extension criada com sucesso: ${projectDir}`,
      openOption,
      revealOption
    );
    if (choice === openOption) {
      await vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(projectDir),
        true
      );
      return;
    }
    if (choice === revealOption) {
      await vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.file(projectDir)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    vscode.window.showErrorMessage(
      `Failed to create client extension: ${message}`
    );
  }
}
async function pickTemplateId() {
  const choice = await vscode.window.showQuickPick(
    CLIENT_EXTENSION_TEMPLATES.map((template) => ({
      label: template.label,
      description: template.description,
      detail: template.detail,
      value: template.id
    })),
    {
      placeHolder: "Escolha o tipo de client extension"
    }
  );
  return choice?.value;
}
async function resolveClientExtensionsDir(resource) {
  if (resource && path2.basename(resource.fsPath) === "client-extensions") {
    return resource.fsPath;
  }
  const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
  const matchingDirs = [];
  for (const folder of workspaceFolders) {
    const candidateDir = path2.join(folder.uri.fsPath, "client-extensions");
    try {
      await fs2.access(candidateDir);
      matchingDirs.push(candidateDir);
    } catch {
      continue;
    }
  }
  if (matchingDirs.length === 1) {
    return matchingDirs[0];
  }
  if (matchingDirs.length > 1) {
    const choice = await vscode.window.showQuickPick(
      matchingDirs.map((dir) => ({
        label: path2.basename(path2.dirname(dir)),
        description: dir,
        value: dir
      })),
      {
        placeHolder: "Escolha em qual pasta client-extensions deseja criar"
      }
    );
    return choice?.value;
  }
  vscode.window.showWarningMessage(
    "Nenhuma pasta client-extensions foi encontrada no workspace atual."
  );
  return void 0;
}
function validateProjectName(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Informe o nome da pasta";
  }
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return "Use apenas letras minusculas, numeros e hifens";
  }
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return "Nao comece ou termine com hifen";
  }
  return void 0;
}

// src/commands/createModule.ts
var fs4 = __toESM(require("node:fs/promises"));
var path4 = __toESM(require("node:path"));
var vscode2 = __toESM(require("vscode"));

// src/core/osgiModuleGenerator.ts
var fs3 = __toESM(require("node:fs/promises"));
var path3 = __toESM(require("node:path"));
var OSGI_MODULE_TEMPLATES = [
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
  }
];
function getOsgiModuleTemplate(templateId) {
  const template = OSGI_MODULE_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Template OSGi invalido: ${templateId}`);
  }
  return template;
}
async function generateOsgiModule(params) {
  const { context, modulesDir, projectName, templateId } = params;
  const templateDir = path3.join(
    context.extensionPath,
    "resources",
    "osgi-module-templates",
    templateId
  );
  const projectDir = path3.join(modulesDir, projectName);
  await assertPathExists2(templateDir, "Template interno nao encontrado");
  await assertPathDoesNotExist2(
    projectDir,
    "Ja existe um modulo OSGi com esse nome"
  );
  const replacements = buildTemplateReplacements2(projectName);
  await copyTemplateDir2(templateDir, projectDir, replacements);
}
async function assertPathExists2(filePath, message) {
  try {
    await fs3.access(filePath);
  } catch {
    throw new Error(`${message}: ${filePath}`);
  }
}
async function assertPathDoesNotExist2(filePath, message) {
  try {
    await fs3.access(filePath);
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      throw error;
    }
  }
}
async function copyTemplateDir2(src, dest, replacements) {
  await fs3.mkdir(dest, { recursive: true });
  const entries = await fs3.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const nextName = applyReplacements2(entry.name, replacements);
    const srcPath = path3.join(src, entry.name);
    const destPath = path3.join(dest, nextName);
    if (entry.isDirectory()) {
      await copyTemplateDir2(srcPath, destPath, replacements);
      continue;
    }
    const content = await fs3.readFile(srcPath, "utf8");
    await fs3.writeFile(destPath, applyReplacements2(content, replacements), "utf8");
  }
}
function applyReplacements2(content, replacements) {
  return Object.entries(replacements).reduce((result, [token, value]) => {
    return result.split(token).join(value);
  }, content);
}
function buildTemplateReplacements2(projectName) {
  const projectTitle = projectName.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const packageSuffix = projectName.replace(/-/g, ".").toLowerCase();
  const packageName = `com.acme.${packageSuffix}`;
  const packagePath = packageName.replace(/\./g, "/");
  const classPrefix = projectName.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  return {
    "__PROJECT_NAME__": projectName,
    "__PROJECT_TITLE__": projectTitle,
    "__PACKAGE_NAME__": packageName,
    "__PACKAGE_PATH__": packagePath,
    "__CLASS_PREFIX__": classPrefix
  };
}

// src/commands/createModule.ts
function registerCreateModuleCommands(context) {
  const commandConfigs = [
    {
      command: "liferay.createModule"
    },
    {
      command: "liferay.createModule.mvcPortlet",
      templateId: "mvc-portlet"
    },
    {
      command: "liferay.createModule.apiService",
      templateId: "api-service"
    }
  ];
  for (const config of commandConfigs) {
    const disposable = vscode2.commands.registerCommand(
      config.command,
      async (resource) => {
        await runCreateModuleFlow(context, resource, config.templateId);
      }
    );
    context.subscriptions.push(disposable);
  }
}
async function runCreateModuleFlow(context, resource, initialTemplateId) {
  try {
    const modulesDir = await resolveModulesDir(resource);
    if (!modulesDir) {
      return;
    }
    const templateId = initialTemplateId ?? await pickTemplateId2();
    if (!templateId) {
      return;
    }
    const template = getOsgiModuleTemplate(templateId);
    const projectName = await vscode2.window.showInputBox({
      prompt: `Nome da pasta para ${template.label}`,
      placeHolder: "ex: acme-foo",
      validateInput: validateProjectName2
    });
    if (!projectName) {
      return;
    }
    const projectDir = path4.join(modulesDir, projectName);
    await vscode2.window.withProgress(
      {
        location: vscode2.ProgressLocation.Notification,
        title: `Criando modulo OSGi ${projectName}...`,
        cancellable: false
      },
      async () => {
        await generateOsgiModule({
          context,
          modulesDir,
          projectName,
          templateId
        });
      }
    );
    const openOption = "Abrir pasta";
    const revealOption = "Revelar no Explorer";
    const choice = await vscode2.window.showInformationMessage(
      `Modulo OSGi criado com sucesso: ${projectDir}`,
      openOption,
      revealOption
    );
    if (choice === openOption) {
      await vscode2.commands.executeCommand(
        "vscode.openFolder",
        vscode2.Uri.file(projectDir),
        true
      );
      return;
    }
    if (choice === revealOption) {
      await vscode2.commands.executeCommand(
        "revealInExplorer",
        vscode2.Uri.file(projectDir)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    vscode2.window.showErrorMessage(`Failed to create OSGi module: ${message}`);
  }
}
async function pickTemplateId2() {
  const choice = await vscode2.window.showQuickPick(
    OSGI_MODULE_TEMPLATES.map((template) => ({
      label: template.label,
      description: template.description,
      detail: template.detail,
      value: template.id
    })),
    {
      placeHolder: "Escolha o tipo de modulo OSGi"
    }
  );
  return choice?.value;
}
async function resolveModulesDir(resource) {
  if (resource && isModulesDir(resource.fsPath)) {
    return resource.fsPath;
  }
  const workspaceFolders = vscode2.workspace.workspaceFolders ?? [];
  const matchingDirs = [];
  for (const folder of workspaceFolders) {
    for (const dirName of ["modules", "modulos"]) {
      const candidateDir = path4.join(folder.uri.fsPath, dirName);
      try {
        await fs4.access(candidateDir);
        matchingDirs.push(candidateDir);
      } catch {
        continue;
      }
    }
  }
  if (matchingDirs.length === 1) {
    return matchingDirs[0];
  }
  if (matchingDirs.length > 1) {
    const choice = await vscode2.window.showQuickPick(
      matchingDirs.map((dir) => ({
        label: path4.basename(path4.dirname(dir)),
        description: dir,
        value: dir
      })),
      {
        placeHolder: "Escolha em qual pasta modules deseja criar"
      }
    );
    return choice?.value;
  }
  vscode2.window.showWarningMessage(
    "Nenhuma pasta modules/modulos foi encontrada no workspace atual."
  );
  return void 0;
}
function isModulesDir(dirPath) {
  const dirName = path4.basename(dirPath).toLowerCase();
  return dirName === "modules" || dirName === "modulos";
}
function validateProjectName2(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Informe o nome da pasta";
  }
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return "Use apenas letras minusculas, numeros e hifens";
  }
  if (!/^[a-z]/.test(trimmed)) {
    return "Comece com uma letra para gerar classes Java validas";
  }
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return "Nao comece ou termine com hifen";
  }
  return void 0;
}

// src/commands/createWorkspace.ts
var path8 = __toESM(require("node:path"));
var vscode4 = __toESM(require("vscode"));

// src/core/versions.ts
var COMMUNITY_VERSIONS = [
  { label: "7.4 GA132", value: "portal-7.4-ga132" },
  { label: "7.4 GA129", value: "portal-7.4-ga129" }
];
var DXP_VERSIONS = [
  { label: "7.4 U102", value: "dxp-7.4-u102" },
  { label: "7.4 U98", value: "dxp-7.4-u98" }
];

// src/core/workspaceGenerator.ts
var fs6 = __toESM(require("node:fs/promises"));
var path6 = __toESM(require("node:path"));

// src/utils/fs.ts
var fs5 = __toESM(require("node:fs/promises"));
var path5 = __toESM(require("node:path"));
async function copyDir(src, dest) {
  await fs5.mkdir(dest, { recursive: true });
  const entries = await fs5.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path5.join(src, entry.name);
    const destPath = path5.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs5.copyFile(srcPath, destPath);
    }
  }
}

// src/core/workspaceGenerator.ts
async function generateWorkspace(params) {
  const { context, workspaceDir, workspaceName, productVersion } = params;
  const templateDir = path6.join(
    context.extensionPath,
    "resources",
    "workspace-template"
  );
  const requiredFiles = [
    path6.join(templateDir, "gradlew"),
    path6.join(templateDir, "gradlew.bat"),
    path6.join(templateDir, "gradle", "wrapper", "gradle-wrapper.jar"),
    path6.join(templateDir, "gradle", "wrapper", "gradle-wrapper.properties")
  ];
  for (const file of requiredFiles) {
    try {
      await fs6.access(file);
    } catch {
      throw new Error(
        `Arquivo obrigat\xF3rio do Gradle Wrapper n\xE3o encontrado: ${file}`
      );
    }
  }
  await fs6.mkdir(workspaceDir, { recursive: true });
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
  await fs6.writeFile(
    path6.join(workspaceDir, "settings.gradle"),
    settingsGradle,
    "utf8"
  );
  await fs6.writeFile(
    path6.join(workspaceDir, "gradle.properties"),
    gradleProperties,
    "utf8"
  );
  await fs6.writeFile(
    path6.join(workspaceDir, ".gitignore"),
    gitignore,
    "utf8"
  );
  await createWorkspaceDirectories(workspaceDir);
}
async function createWorkspaceDirectories(workspaceDir) {
  const directories = [
    "bundles",
    "modules",
    "configs",
    "client-extensions",
    "themes"
  ];
  for (const dir of directories) {
    await fs6.mkdir(path6.join(workspaceDir, dir), { recursive: true });
  }
  const configsDir = path6.join(workspaceDir, "configs", "local");
  await fs6.mkdir(configsDir, { recursive: true });
}

// src/core/gradleRunner.ts
var fs7 = __toESM(require("node:fs/promises"));
var path7 = __toESM(require("node:path"));
var import_node_child_process = require("node:child_process");

// src/core/output.ts
var vscode3 = __toESM(require("vscode"));
var liferayOutput = vscode3.window.createOutputChannel(
  "Liferay Workspace"
);
function log(message) {
  liferayOutput.appendLine(message);
}

// src/core/gradleRunner.ts
async function runGradleCommand(workspaceDir, args, options = {}) {
  const { command, commandArgs } = await resolveGradleCommand(
    workspaceDir,
    args
  );
  await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(command, commandArgs, {
      cwd: workspaceDir,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdoutBuffer = "";
    let stderrBuffer = "";
    let stderrOutput = "";
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      stdoutBuffer = flushLines(stdoutBuffer, (line) => {
        log(line);
        options.onLine?.(line);
      });
    });
    child.stderr.on("data", (chunk) => {
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
      const message = stderrOutput.trim() || `Gradle finalizou com c\xF3digo ${code}`;
      reject(new Error(message));
    });
  });
}
async function resolveGradleCommand(workspaceDir, args) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      commandArgs: ["/c", "gradlew.bat", ...args]
    };
  }
  const gradlewPath = path7.join(workspaceDir, "gradlew");
  await fs7.chmod(gradlewPath, 493);
  return {
    command: gradlewPath,
    commandArgs: args
  };
}
function flushLines(buffer, onLine) {
  const lines = buffer.split(/\r?\n/);
  const remaining = lines.pop() ?? "";
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    if (shouldIgnoreGradleLine(trimmedLine)) {
      continue;
    }
    onLine(trimmedLine);
  }
  return remaining;
}
function shouldIgnoreGradleLine(line) {
  const normalized = line.toLowerCase();
  if (/^[a-z]:\\.*>/.test(normalized)) {
    return true;
  }
  if (normalized.startsWith("if ")) {
    return true;
  }
  if (normalized.startsWith("set ")) {
    return true;
  }
  if (normalized.startsWith("for %")) {
    return true;
  }
  if (normalized.includes(" endlocal")) {
    return true;
  }
  if (normalized.includes(" setlocal")) {
    return true;
  }
  return false;
}

// src/core/javaValidator.ts
var import_node_child_process2 = require("node:child_process");
var import_node_util = require("node:util");
var execFileAsync = (0, import_node_util.promisify)(import_node_child_process2.execFile);
async function validateJava() {
  try {
    await execFileAsync("java", ["-version"]);
  } catch {
    throw new Error(
      "Java n\xE3o encontrado. Instale JDK 17 e configure JAVA_HOME."
    );
  }
}

// src/commands/createWorkspace.ts
function registerCreateWorkspaceCommand(context) {
  const disposable = vscode4.commands.registerCommand(
    "liferay.createWorkspace",
    async () => {
      try {
        const edition = await pickEdition();
        if (!edition) {
          return;
        }
        const productVersion = await pickProductVersion(edition);
        if (!productVersion) {
          return;
        }
        const workspaceName = await vscode4.window.showInputBox({
          prompt: "Nome do workspace",
          placeHolder: "ex: acme-liferay-workspace",
          validateInput: (value) => {
            if (!value.trim()) {
              return "Informe o nome do workspace";
            }
            if (/[\\/:\*\?"<>\|]/.test(value)) {
              return "O nome cont\xE9m caracteres inv\xE1lidos para pasta";
            }
            return void 0;
          }
        });
        if (!workspaceName) {
          return;
        }
        const selectedFolder = await vscode4.window.showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: "Selecionar pasta destino"
        });
        if (!selectedFolder?.length) {
          return;
        }
        const baseDir = selectedFolder[0].fsPath;
        const workspaceDir = path8.join(baseDir, workspaceName);
        await vscode4.window.withProgress(
          {
            location: vscode4.ProgressLocation.Notification,
            title: `Criando workspace ${workspaceName}...`,
            cancellable: false
          },
          async () => {
            await generateWorkspace({
              context,
              workspaceDir,
              workspaceName,
              productVersion
            });
            await validateJava();
            await runGradleCommand(workspaceDir, ["--version"]);
            await openWorkspace(workspaceDir);
          }
        );
        const openOption = "Abrir workspace";
        const choice = await vscode4.window.showInformationMessage(
          `Workspace criado com sucesso: ${workspaceDir}`,
          openOption
        );
        if (choice === openOption) {
          await openWorkspace(workspaceDir);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        vscode4.window.showErrorMessage(
          `Failed to create workspace: ${message}`
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}
async function pickEdition() {
  const choice = await vscode4.window.showQuickPick(
    [
      {
        label: "DXP",
        description: "Liferay DXP 7.4",
        value: "dxp"
      },
      {
        label: "Community",
        description: "Liferay Portal GA 7.4",
        value: "community"
      }
    ],
    {
      placeHolder: "Escolha a edi\xE7\xE3o do Liferay"
    }
  );
  return choice?.value;
}
async function pickProductVersion(edition) {
  const options = edition === "dxp" ? DXP_VERSIONS : COMMUNITY_VERSIONS;
  const choice = await vscode4.window.showQuickPick(
    options.map((option) => ({
      label: option.label,
      description: option.value,
      value: option.value
    })),
    {
      placeHolder: "Escolha a vers\xE3o do produto"
    }
  );
  return choice?.value;
}
async function openWorkspace(workspaceDir) {
  const workspaceUri = vscode4.Uri.file(workspaceDir);
  await vscode4.commands.executeCommand(
    "vscode.openFolder",
    workspaceUri,
    true
  );
}

// src/commands/downloadBundle.ts
var fs8 = __toESM(require("node:fs/promises"));
var path9 = __toESM(require("node:path"));
var vscode5 = __toESM(require("vscode"));
function registerDownloadBundleCommand(context) {
  const disposable = vscode5.commands.registerCommand(
    "liferay.downloadBundle",
    async (resource) => {
      try {
        const workspaceFolder = resource ? vscode5.workspace.getWorkspaceFolder(resource) : vscode5.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode5.window.showErrorMessage(
            "Abra um Liferay Workspace antes de baixar o bundle."
          );
          return;
        }
        if (resource && await isNonEmptyBundleDir(resource)) {
          vscode5.window.showWarningMessage(
            "A opcao de download so pode ser usada quando a pasta bundle/bundles estiver vazia."
          );
          return;
        }
        const workspaceDir = workspaceFolder.uri.fsPath;
        let progressValue = 0;
        liferayOutput.show(true);
        await vscode5.window.withProgress(
          {
            location: vscode5.ProgressLocation.Notification,
            title: "Baixando bundle do Liferay...",
            cancellable: false
          },
          async (progress) => {
            progress.report({
              increment: 5,
              message: "Validando Java..."
            });
            await validateJava();
            progressValue = 10;
            progress.report({
              increment: 5,
              message: "Iniciando Gradle..."
            });
            await runGradleCommand(workspaceDir, ["initBundle"], {
              onLine: (line) => {
                const nextMessage = mapGradleLineToMessage(line);
                const nextIncrement = progressValue < 90 ? 2 : 0;
                if (nextIncrement > 0) {
                  progressValue += nextIncrement;
                }
                progress.report({
                  increment: nextIncrement,
                  message: nextMessage
                });
              }
            });
            if (progressValue < 100) {
              progress.report({
                increment: 100 - progressValue,
                message: "Bundle finalizado."
              });
            }
          }
        );
        await vscode5.commands.executeCommand("liferay.managePortal");
        vscode5.window.showInformationMessage(
          "Bundle baixado com sucesso. O painel de controle do portal foi aberto."
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro desconhecido";
        vscode5.window.showErrorMessage(
          `Falha ao baixar o bundle: ${message}`
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}
async function isNonEmptyBundleDir(resource) {
  const folderName = path9.basename(resource.fsPath).toLowerCase();
  if (folderName !== "bundle" && folderName !== "bundles") {
    return false;
  }
  const entries = await fs8.readdir(resource.fsPath, { withFileTypes: true });
  return entries.length > 0;
}
function mapGradleLineToMessage(line) {
  const normalized = line.toLowerCase();
  if (normalized.includes(":verifyproduct")) {
    return "Verificando produto...";
  }
  if (normalized.includes(":downloadbundle skipped")) {
    return "Download do bundle foi ignorado.";
  }
  if (normalized.includes(":downloadbundle")) {
    return "Baixando bundle...";
  }
  if (normalized.includes(":verifybundle")) {
    return "Verificando bundle...";
  }
  if (normalized.includes(":initbundle")) {
    return "Inicializando bundle...";
  }
  if (normalized.includes("build successful")) {
    return "Build concluido com sucesso.";
  }
  if (normalized.includes("build failed")) {
    return "Build falhou.";
  }
  if (normalized.includes("downloading")) {
    return line;
  }
  if (normalized.includes("download")) {
    return line;
  }
  if (normalized.includes("extract")) {
    return "Extraindo bundle...";
  }
  if (normalized.includes("building")) {
    return "Processando tarefa Gradle...";
  }
  return line.length > 80 ? `${line.slice(0, 77)}...` : line;
}

// src/commands/managePortal.ts
var vscode6 = __toESM(require("vscode"));
function registerManagePortalCommands(context, portalRuntime) {
  const panel = new PortalControlPanel(portalRuntime);
  context.subscriptions.push(
    panel,
    vscode6.commands.registerCommand("liferay.managePortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();
      if (!workspaceDir) {
        vscode6.window.showErrorMessage(
          "Abra um Liferay Workspace antes de gerenciar o portal."
        );
        return;
      }
      panel.show(workspaceDir);
    }),
    vscode6.commands.registerCommand("liferay.startPortal", async () => {
      const workspaceDir = getCurrentWorkspaceDir();
      if (!workspaceDir) {
        vscode6.window.showErrorMessage(
          "Abra um Liferay Workspace antes de iniciar o portal."
        );
        return;
      }
      panel.show(workspaceDir);
      await portalRuntime.start(workspaceDir);
    }),
    vscode6.commands.registerCommand("liferay.stopPortal", async () => {
      panel.show();
      await portalRuntime.stop();
    })
  );
}
function getCurrentWorkspaceDir() {
  return vscode6.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
var PortalControlPanel = class {
  constructor(portalRuntime) {
    this.portalRuntime = portalRuntime;
    this.disposables = [];
    this.disposables.push(
      portalRuntime.onDidChangeState((state) => {
        this.panel?.webview.postMessage({
          type: "state",
          payload: this.buildViewState(state)
        });
      })
    );
  }
  show(workspaceDir) {
    if (workspaceDir) {
      this.workspaceDir = workspaceDir;
    }
    if (!this.panel) {
      this.panel = vscode6.window.createWebviewPanel(
        "liferayPortalControl",
        "Liferay Portal Control",
        vscode6.ViewColumn.Active,
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
            const text = error instanceof Error ? error.message : "Erro desconhecido";
            vscode6.window.showErrorMessage(text);
          }
        },
        void 0,
        this.disposables
      );
      this.panel.onDidDispose(() => {
        this.panel = void 0;
      }, void 0, this.disposables);
    }
    this.panel.reveal(vscode6.ViewColumn.Active, true);
    this.panel.webview.postMessage({
      type: "state",
      payload: this.buildViewState(this.portalRuntime.getState())
    });
  }
  dispose() {
    this.panel?.dispose();
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
  getHtml(webview) {
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
  buildViewState(state) {
    if (!state.workspaceDir && this.workspaceDir) {
      return {
        ...state,
        workspaceDir: this.workspaceDir
      };
    }
    return state;
  }
};
function getNonce() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = "";
  for (let index = 0; index < 32; index += 1) {
    value += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return value;
}

// src/core/portalRuntime.ts
var fs9 = __toESM(require("node:fs/promises"));
var path10 = __toESM(require("node:path"));
var import_node_child_process3 = require("node:child_process");
var vscode7 = __toESM(require("vscode"));
var PortalRuntime = class {
  constructor() {
    this.state = {
      status: "idle",
      logs: []
    };
    this.onDidChangeStateEmitter = new vscode7.EventEmitter();
    this.onDidChangeState = this.onDidChangeStateEmitter.event;
  }
  getState() {
    return {
      ...this.state,
      logs: [...this.state.logs]
    };
  }
  async start(workspaceDir) {
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
      lastError: void 0
    });
    await new Promise((resolve, reject) => {
      const child = (0, import_node_child_process3.spawn)(command.command, command.args, {
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
      child.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk.toString();
        stdoutBuffer = this.flushLines(stdoutBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });
      child.stderr.on("data", (chunk) => {
        stderrBuffer += chunk.toString();
        stderrBuffer = this.flushLines(stderrBuffer, (line) => {
          this.handlePortalLine(line);
          settleStarted();
        });
      });
      child.on("error", (error) => {
        this.child = void 0;
        this.updateState({
          status: "error",
          pid: void 0,
          lastError: error.message
        });
        reject(error);
      });
      child.on("close", (code) => {
        this.child = void 0;
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
            pid: void 0,
            lastError: void 0
          });
          settleStarted();
          return;
        }
        const message = code === 0 ? "Portal finalizado." : `Portal finalizou com codigo ${code ?? "desconhecido"}.`;
        this.appendLog(message);
        this.updateState({
          status: code === 0 ? "idle" : "error",
          pid: void 0,
          lastError: code === 0 ? void 0 : message
        });
        if (!resolved && code !== 0) {
          reject(new Error(message));
          return;
        }
        settleStarted();
      });
    });
  }
  async stop() {
    if (!this.child || this.state.status === "idle" || this.state.status === "stopping") {
      return;
    }
    const { portalDir } = this.state;
    if (!portalDir) {
      throw new Error("Diretorio do portal nao encontrado para parar o processo.");
    }
    this.appendLog("Parando portal...");
    this.updateState({
      status: "stopping",
      lastError: void 0
    });
    await stopPortalProcess(this.child.pid, portalDir);
  }
  dispose() {
    this.onDidChangeStateEmitter.dispose();
  }
  handlePortalLine(line) {
    log(line);
    this.appendLog(line);
    const normalized = line.toLowerCase();
    if (this.state.status === "starting" && (normalized.includes("server startup in") || normalized.includes("startup completed") || normalized.includes("liferay home"))) {
      this.updateState({
        status: "running"
      });
    }
    if (normalized.includes("severe") || normalized.includes("exception") || normalized.includes("address already in use")) {
      this.updateState({
        lastError: line
      });
    }
  }
  appendLog(message) {
    const logs = [...this.state.logs, message].slice(-400);
    this.updateState({ logs });
  }
  updateState(patch) {
    this.state = {
      ...this.state,
      ...patch
    };
    this.onDidChangeStateEmitter.fire(this.getState());
  }
  flushLines(buffer, onLine) {
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
};
async function findPortalDir(workspaceDir) {
  const bundlesDir = path10.join(workspaceDir, "bundles");
  let entries;
  try {
    entries = await fs9.readdir(bundlesDir, { withFileTypes: true });
  } catch {
    throw new Error("A pasta bundles nao foi encontrada. Execute o download do bundle primeiro.");
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const portalDir = path10.join(bundlesDir, entry.name);
    const catalinaBat = path10.join(portalDir, "bin", "catalina.bat");
    const catalinaSh = path10.join(portalDir, "bin", "catalina.sh");
    if (await exists(catalinaBat) || await exists(catalinaSh)) {
      return portalDir;
    }
  }
  throw new Error(
    "Nenhum bundle Tomcat valido foi encontrado em bundles/. Verifique se o initBundle terminou corretamente."
  );
}
function buildPortalCommand(portalDir, action) {
  const binDir = path10.join(portalDir, "bin");
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/c", "catalina.bat", action],
      cwd: binDir
    };
  }
  return {
    command: path10.join(binDir, "catalina.sh"),
    args: [action],
    cwd: binDir
  };
}
async function stopPortalProcess(pid, portalDir) {
  const stopCommand = buildPortalCommand(portalDir, "stop");
  await new Promise((resolve, reject) => {
    const child = (0, import_node_child_process3.spawn)(stopCommand.command, stopCommand.args, {
      cwd: stopCommand.cwd,
      stdio: "ignore"
    });
    child.on("error", reject);
    child.on("close", () => resolve());
  });
  if (!pid) {
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 5e3));
  if (process.platform === "win32") {
    await new Promise((resolve, reject) => {
      const killer = (0, import_node_child_process3.spawn)("taskkill", ["/PID", String(pid), "/T", "/F"], {
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
  }
}
async function exists(filePath) {
  try {
    await fs9.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// src/extension.ts
function activate(context) {
  const portalRuntime = new PortalRuntime();
  registerCreateWorkspaceCommand(context);
  registerCreateClientExtensionCommands(context);
  registerCreateModuleCommands(context);
  registerDownloadBundleCommand(context);
  registerManagePortalCommands(context, portalRuntime);
  context.subscriptions.push(portalRuntime);
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

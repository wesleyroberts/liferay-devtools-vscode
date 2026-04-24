<p align="center">
  <img src="images/icon.png" alt="Liferay Dev Tools" width="160" />
</p>

# Liferay Dev Tools

<p align="center">
  <strong>Language:</strong>
  <a href="#portugues">Português</a> |
  <a href="#english">English</a> |
  <a href="#espanol">Español</a>
</p>

---

<a id="portugues"></a>

## Português

Crie e gerencie workspaces Liferay 7.4 no VS Code com um fluxo guiado, usando `Gradle Wrapper` e sem precisar de Blade CLI ou Gradle instalado globalmente.

## Tutorial em Vídeo

Aprenda o fluxo principal da extensão, desde a criação do workspace até o uso dos comandos mais importantes:

### `Ctrl + Shift + P`

<p align="center">
  <img src="images/tutorial-gift.gif" alt="Liferay Dev Tools tutorial" width="600" />
</p>

## O Que Esta Extensão Faz

Esta extensão foi criada para simplificar o setup e o uso de projetos Liferay diretamente no Visual Studio Code, deixando o fluxo mais previsível para quem quer criar workspace, baixar bundle, gerar client extensions e operar o portal sem sair da IDE.

Hoje, com a extensão, você consegue:

- criar um novo Liferay Workspace
- escolher entre `Liferay DXP` e `Liferay Portal Community`
- selecionar a versão do produto
- gerar a estrutura padrão do workspace
- usar `Gradle Wrapper` embutido no workspace
- validar o Java antes da execução
- executar `initBundle` sem Blade CLI
- criar client extensions a partir da pasta `client-extensions`
- abrir o workspace automaticamente no VS Code
- iniciar e parar o portal a partir de um painel visual

## Requisitos

Para usar a extensão, tenha somente estes pontos em mente:

- use `Java 11` ou superior
- não é necessário instalar `Blade CLI`
- não é necessário instalar `Gradle` globalmente
- a extensão executa as operações do portal com o `Gradle Wrapper` do workspace
- é necessário acesso à internet para baixar dependências e bundles quando preciso

## Instalação

1. Instale a extensão no VS Code.
2. Garanta que o `Java 11` ou superior esteja configurado na máquina.
3. Abra o Command Palette no VS Code.
4. Execute os comandos da extensão para criar e operar seu workspace.

## Guia Rápido

### 1. Criar o workspace

Execute `Liferay: Create Workspace`.

Fluxo:

1. Escolha a edição do produto
2. Escolha a versão
3. Informe o nome do workspace
4. Escolha a pasta de destino
5. A extensão gera os arquivos
6. O Java é validado
7. O `Gradle Wrapper` é testado
8. O workspace pode ser aberto automaticamente

### 2. Baixar o bundle

Abra o workspace criado e execute `Liferay: Download Bundle`.

Esse comando:

- valida o Java
- roda o Gradle em tempo real
- mostra progresso visual durante a execução
- envia logs para o canal `Liferay Workspace`
- abre automaticamente o painel de controle do portal ao finalizar

### 3. Criar client extensions

Use `Liferay: Create Client Extension` ou clique com o botão direito sobre a pasta `client-extensions`.

Fluxos suportados:

- pelo Command Palette com escolha do tipo
- pelo clique direito em cima da pasta `client-extensions`
- submenu contextual com templates já disponíveis

### 4. Gerenciar o portal

Use `Liferay: Manage Portal` para abrir o painel visual e controlar o portal do bundle baixado.

## Comandos Disponíveis

### `Liferay: Create Workspace`

Cria um novo workspace com:

- `gradlew` e `gradlew.bat`
- `gradle/wrapper`
- `settings.gradle`
- `gradle.properties`
- `.gitignore`
- pastas padrão do projeto

### `Liferay: Download Bundle`

Executa o `initBundle` no workspace aberto para baixar e preparar o bundle local.

### `Liferay: Create Client Extension`

Cria uma nova client extension dentro da pasta `client-extensions`.

Templates disponíveis no momento:

- `Custom Element`
- `Custom Element React Vite`
- `Custom Element Angular`
- `Site Initializer`
- `Batch`
- `ETC Cron`
- `ETC Node`
- `ETC Spring Boot`
- `Global CSS Company`
- `Global CSS Page`
- `Global JS Instance`
- `Global JS`
- `Global CSS`
- `IFrame`

Os templates ficam empacotados na própria extensão em `resources/client-extension-templates`.

### `Liferay: Deploy Project`

Executa o deploy de uma `client extension` ou de um `módulo OSGi` usando o `Gradle Wrapper` do workspace.

Esse comando:

- detecta automaticamente se o alvo está em `client-extensions` ou `modules`
- pode ser usado pelo `Command Palette`
- também pode ser acionado pelo menu contextual das pastas `client-extensions` e `modules`
- permite escolher o projeto quando houver mais de um candidato
- executa a task Gradle `deploy` do projeto selecionado

### `Liferay: Manage Portal`

Abre um painel visual para controlar o portal do bundle baixado.

Esse painel:

- detecta o bundle em `bundles/`
- oferece ações de `Start Portal` e `Stop Portal`
- mostra logs em tempo real
- exibe status, `PID` e último erro conhecido

## Recursos Disponíveis Hoje

Estes são os recursos já disponíveis na extensão neste momento:

- criação de workspace Liferay 7.4
- download de bundle com `initBundle`
- deploy de client extensions e módulos OSGi com `Gradle Wrapper`
- uso de `Gradle Wrapper` sem dependência de Gradle global
- fluxo sem dependência de Blade CLI
- criação de client extensions por comando e menu contextual
- painel visual para iniciar e parar o portal
- acompanhamento de logs e status do portal

## Estrutura Gerada

```text
workspace
|- bundles
|- client-extensions
|- configs
|  |- common
|  \- local
|- modules
|- themes
|- wars
|- gradle
|  \- wrapper
|- gradlew
|- gradlew.bat
|- settings.gradle
|- gradle.properties
\- .gitignore
```

## Exemplo de `gradle.properties`

```properties
liferay.workspace.bundle.dist.include.metadata=true
liferay.workspace.modules.dir=modules
liferay.workspace.themes.dir=themes
liferay.workspace.wars.dir=modules
microsoft.translator.subscription.key=
liferay.workspace.product=portal-7.4-ga132
target.platform.index.sources=false
```

## Como Executar em Desenvolvimento

```bash
npm install
npm run compile
```

Depois:

1. abra o projeto no VS Code
2. pressione `F5`
3. uma nova janela de Extension Development Host será aberta
4. execute os comandos da extensão pelo Command Palette

## Stack

- TypeScript
- VS Code Extension API
- Node.js `child_process`
- Gradle Wrapper
- Liferay Workspace Plugin

## Arquitetura

```text
src
|- commands
|  \- createWorkspace.ts
|- core
|  |- workspaceGenerator.ts
|  |- gradleRunner.ts
|  |- javaValidator.ts
|  \- versions.ts
|- utils
|  \- fs.ts
\- extension.ts
```

## Roadmap

Próximas funcionalidades planejadas:

- `Liferay: Create Module`
- `Liferay: Create Client Extension`
- `Liferay: Start Portal`
- melhorias no painel de runtime do portal
- melhorias no progresso do download
- detecção mais inteligente de caches e bundles locais

## Por Que Este Projeto Existe

Ferramentas de setup fazem diferença no dia a dia. A proposta aqui é entregar uma experiência mais moderna para desenvolvedores Liferay dentro do VS Code, reduzindo fricção e deixando o ambiente pronto com menos passos.

Em outras palavras: menos configuração manual, mais desenvolvimento.

## Status

Projeto em evolução ativa.

Já funciona para criação de workspace, execução do `initBundle`, criação de client extensions e gerenciamento inicial do portal, com estrutura pronta para crescimento.

## Contribuição

Ideias, melhorias e sugestões são muito bem-vindas. Se quiser evoluir este projeto, sinta-se à vontade para abrir issue, propor ajustes ou expandir os comandos existentes.

<p align="right"><a href="#liferay-dev-tools">Back to top</a></p>

---

<a id="english"></a>

## English

Create and manage Liferay 7.4 workspaces in VS Code with a guided workflow, using `Gradle Wrapper` and without needing Blade CLI or a globally installed Gradle.

## Video Tutorial

Learn the main extension workflow, from creating a workspace to using the most important commands:

### `Ctrl + Shift + P`

<p align="center">
  <img src="images/tutorial-gift.gif" alt="Liferay Dev Tools tutorial" width="600" />
</p>

## What This Extension Does

This extension was built to simplify the setup and daily use of Liferay projects directly inside Visual Studio Code, making the workflow more predictable for anyone who wants to create a workspace, download a bundle, generate client extensions, and operate the portal without leaving the IDE.

Today, with this extension, you can:

- create a new Liferay Workspace
- choose between `Liferay DXP` and `Liferay Portal Community`
- select the product version
- generate the standard workspace structure
- use the `Gradle Wrapper` included in the workspace
- validate Java before execution
- run `initBundle` without Blade CLI
- create client extensions from the `client-extensions` folder
- open the workspace automatically in VS Code
- start and stop the portal from a visual panel

## Requirements

To use the extension, keep these points in mind:

- use `Java 11` or higher
- installing `Blade CLI` is not required
- installing Gradle globally is not required
- the extension runs portal operations with the workspace `Gradle Wrapper`
- internet access is required when dependencies and bundles need to be downloaded

## Installation

1. Install the extension in VS Code.
2. Make sure `Java 11` or higher is configured on your machine.
3. Open the Command Palette in VS Code.
4. Run the extension commands to create and manage your workspace.

## Quick Guide

### 1. Create the workspace

Run `Liferay: Create Workspace`.

Flow:

1. Choose the product edition
2. Choose the version
3. Enter the workspace name
4. Choose the destination folder
5. The extension generates the files
6. Java is validated
7. The `Gradle Wrapper` is tested
8. The workspace can be opened automatically

### 2. Download the bundle

Open the created workspace and run `Liferay: Download Bundle`.

This command:

- validates Java
- runs Gradle in real time
- shows visual progress during execution
- sends logs to the `Liferay Workspace` channel
- automatically opens the portal control panel when finished

### 3. Create client extensions

Use `Liferay: Create Client Extension` or right-click the `client-extensions` folder.

Supported flows:

- through the Command Palette with type selection
- by right-clicking the `client-extensions` folder
- through a contextual submenu with available templates

### 4. Manage the portal

Use `Liferay: Manage Portal` to open the visual panel and control the downloaded bundle portal.

## Available Commands

### `Liferay: Create Workspace`

Creates a new workspace with:

- `gradlew` and `gradlew.bat`
- `gradle/wrapper`
- `settings.gradle`
- `gradle.properties`
- `.gitignore`
- standard project folders

### `Liferay: Download Bundle`

Runs `initBundle` in the open workspace to download and prepare the local bundle.

### `Liferay: Create Client Extension`

Creates a new client extension inside the `client-extensions` folder.

Currently available templates:

- `Custom Element`
- `Custom Element React Vite`
- `Custom Element Angular`
- `Site Initializer`
- `Batch`
- `ETC Cron`
- `ETC Node`
- `ETC Spring Boot`
- `Global CSS Company`
- `Global CSS Page`
- `Global JS Instance`
- `Global JS`
- `Global CSS`
- `IFrame`

The templates are bundled directly in the extension under `resources/client-extension-templates`.

### `Liferay: Deploy Project`

Runs deploy for a `client extension` or an `OSGi module` using the workspace `Gradle Wrapper`.

This command:

- automatically detects whether the target is under `client-extensions` or `modules`
- can be used from the `Command Palette`
- can also be triggered from the context menu on `client-extensions` and `modules`
- lets you choose the project when more than one candidate is available
- runs the selected project's Gradle `deploy` task

### `Liferay: Manage Portal`

Opens a visual panel to control the downloaded bundle portal.

This panel:

- detects the bundle in `bundles/`
- offers `Start Portal` and `Stop Portal` actions
- shows logs in real time
- displays status, `PID`, and the latest known error

## Features Available Today

These features are already available in the extension right now:

- Liferay 7.4 workspace creation
- bundle download with `initBundle`
- deploy for client extensions and OSGi modules with `Gradle Wrapper`
- `Gradle Wrapper` usage without a global Gradle dependency
- workflow without Blade CLI dependency
- client extension creation by command and context menu
- visual panel to start and stop the portal
- portal log and status monitoring

## Generated Structure

```text
workspace
|- bundles
|- client-extensions
|- configs
|  |- common
|  \- local
|- modules
|- themes
|- wars
|- gradle
|  \- wrapper
|- gradlew
|- gradlew.bat
|- settings.gradle
|- gradle.properties
\- .gitignore
```

## `gradle.properties` Example

```properties
liferay.workspace.bundle.dist.include.metadata=true
liferay.workspace.modules.dir=modules
liferay.workspace.themes.dir=themes
liferay.workspace.wars.dir=modules
microsoft.translator.subscription.key=
liferay.workspace.product=portal-7.4-ga132
target.platform.index.sources=false
```

## Running in Development

```bash
npm install
npm run compile
```

Then:

1. open the project in VS Code
2. press `F5`
3. a new Extension Development Host window will open
4. run the extension commands from the Command Palette

## Stack

- TypeScript
- VS Code Extension API
- Node.js `child_process`
- Gradle Wrapper
- Liferay Workspace Plugin

## Architecture

```text
src
|- commands
|  \- createWorkspace.ts
|- core
|  |- workspaceGenerator.ts
|  |- gradleRunner.ts
|  |- javaValidator.ts
|  \- versions.ts
|- utils
|  \- fs.ts
\- extension.ts
```

## Roadmap

Planned features:

- `Liferay: Create Module`
- `Liferay: Create Client Extension`
- `Liferay: Start Portal`
- improvements to the portal runtime panel
- improvements to download progress
- smarter detection of local caches and bundles

## Why This Project Exists

Setup tools make a real difference in day-to-day work. The goal here is to deliver a more modern experience for Liferay developers inside VS Code, reducing friction and getting the environment ready with fewer steps.

In other words: less manual setup, more development.

## Status

Project under active development.

It already works for workspace creation, `initBundle` execution, client extension creation, and initial portal management, with a structure ready to grow.

## Contributing

Ideas, improvements, and suggestions are very welcome. If you want to evolve this project, feel free to open an issue, propose adjustments, or expand the existing commands.

<p align="right"><a href="#liferay-dev-tools">Back to top</a></p>

---

<a id="espanol"></a>

## Español

Crea y gestiona workspaces de Liferay 7.4 en VS Code con un flujo guiado, usando `Gradle Wrapper` y sin necesitar Blade CLI ni Gradle instalado globalmente.

## Tutorial en Video

Aprende el flujo principal de la extensión, desde la creación del workspace hasta el uso de los comandos más importantes:

### `Ctrl + Shift + P`

<p align="center">
  <img src="images/tutorial-gift.gif" alt="Liferay Dev Tools tutorial" width="600" />
</p>

## Qué Hace Esta Extensión

Esta extensión fue creada para simplificar la configuración y el uso de proyectos Liferay directamente en Visual Studio Code, haciendo el flujo más predecible para quien quiera crear un workspace, descargar un bundle, generar client extensions y operar el portal sin salir del IDE.

Hoy, con la extensión, puedes:

- crear un nuevo Liferay Workspace
- elegir entre `Liferay DXP` y `Liferay Portal Community`
- seleccionar la versión del producto
- generar la estructura estándar del workspace
- usar el `Gradle Wrapper` incluido en el workspace
- validar Java antes de la ejecución
- ejecutar `initBundle` sin Blade CLI
- crear client extensions desde la carpeta `client-extensions`
- abrir el workspace automáticamente en VS Code
- iniciar y detener el portal desde un panel visual

## Requisitos

Para usar la extensión, solo ten en cuenta estos puntos:

- usa `Java 11` o superior
- no es necesario instalar `Blade CLI`
- no es necesario instalar Gradle globalmente
- la extensión ejecuta las operaciones del portal con el `Gradle Wrapper` del workspace
- se requiere acceso a internet para descargar dependencias y bundles cuando sea necesario

## Instalación

1. Instala la extensión en VS Code.
2. Asegúrate de que `Java 11` o superior esté configurado en tu máquina.
3. Abre la Command Palette en VS Code.
4. Ejecuta los comandos de la extensión para crear y gestionar tu workspace.

## Guía Rápida

### 1. Crear el workspace

Ejecuta `Liferay: Create Workspace`.

Flujo:

1. Elige la edición del producto
2. Elige la versión
3. Ingresa el nombre del workspace
4. Elige la carpeta de destino
5. La extensión genera los archivos
6. Se valida Java
7. Se prueba el `Gradle Wrapper`
8. El workspace puede abrirse automáticamente

### 2. Descargar el bundle

Abre el workspace creado y ejecuta `Liferay: Download Bundle`.

Este comando:

- valida Java
- ejecuta Gradle en tiempo real
- muestra progreso visual durante la ejecución
- envía logs al canal `Liferay Workspace`
- abre automáticamente el panel de control del portal al finalizar

### 3. Crear client extensions

Usa `Liferay: Create Client Extension` o haz clic derecho sobre la carpeta `client-extensions`.

Flujos soportados:

- desde la Command Palette con selección de tipo
- con clic derecho sobre la carpeta `client-extensions`
- mediante un submenú contextual con plantillas ya disponibles

### 4. Gestionar el portal

Usa `Liferay: Manage Portal` para abrir el panel visual y controlar el portal del bundle descargado.

## Comandos Disponibles

### `Liferay: Create Workspace`

Crea un nuevo workspace con:

- `gradlew` y `gradlew.bat`
- `gradle/wrapper`
- `settings.gradle`
- `gradle.properties`
- `.gitignore`
- carpetas estándar del proyecto

### `Liferay: Download Bundle`

Ejecuta `initBundle` en el workspace abierto para descargar y preparar el bundle local.

### `Liferay: Create Client Extension`

Crea una nueva client extension dentro de la carpeta `client-extensions`.

Plantillas disponibles en este momento:

- `Custom Element`
- `Custom Element React Vite`
- `Custom Element Angular`
- `Site Initializer`
- `Batch`
- `ETC Cron`
- `ETC Node`
- `ETC Spring Boot`
- `Global CSS Company`
- `Global CSS Page`
- `Global JS Instance`
- `Global JS`
- `Global CSS`
- `IFrame`

Las plantillas vienen empaquetadas dentro de la propia extensión en `resources/client-extension-templates`.

### `Liferay: Deploy Project`

Ejecuta el deploy de una `client extension` o de un `módulo OSGi` usando el `Gradle Wrapper` del workspace.

Este comando:

- detecta automáticamente si el destino está en `client-extensions` o `modules`
- puede usarse desde la `Command Palette`
- también puede activarse desde el menú contextual de `client-extensions` y `modules`
- permite elegir el proyecto cuando hay más de un candidato
- ejecuta la tarea Gradle `deploy` del proyecto seleccionado

### `Liferay: Manage Portal`

Abre un panel visual para controlar el portal del bundle descargado.

Este panel:

- detecta el bundle en `bundles/`
- ofrece acciones de `Start Portal` y `Stop Portal`
- muestra logs en tiempo real
- exhibe estado, `PID` y el último error conocido

## Funcionalidades Disponibles Hoy

Estas son las funcionalidades ya disponibles en la extensión en este momento:

- creación de workspace Liferay 7.4
- descarga de bundle con `initBundle`
- deploy de client extensions y módulos OSGi con `Gradle Wrapper`
- uso de `Gradle Wrapper` sin dependencia de Gradle global
- flujo sin dependencia de Blade CLI
- creación de client extensions por comando y menú contextual
- panel visual para iniciar y detener el portal
- seguimiento de logs y estado del portal

## Estructura Generada

```text
workspace
|- bundles
|- client-extensions
|- configs
|  |- common
|  \- local
|- modules
|- themes
|- wars
|- gradle
|  \- wrapper
|- gradlew
|- gradlew.bat
|- settings.gradle
|- gradle.properties
\- .gitignore
```

## Ejemplo de `gradle.properties`

```properties
liferay.workspace.bundle.dist.include.metadata=true
liferay.workspace.modules.dir=modules
liferay.workspace.themes.dir=themes
liferay.workspace.wars.dir=modules
microsoft.translator.subscription.key=
liferay.workspace.product=portal-7.4-ga132
target.platform.index.sources=false
```

## Cómo Ejecutar en Desarrollo

```bash
npm install
npm run compile
```

Después:

1. abre el proyecto en VS Code
2. presiona `F5`
3. se abrirá una nueva ventana de Extension Development Host
4. ejecuta los comandos de la extensión desde la Command Palette

## Stack

- TypeScript
- VS Code Extension API
- Node.js `child_process`
- Gradle Wrapper
- Liferay Workspace Plugin

## Arquitectura

```text
src
|- commands
|  \- createWorkspace.ts
|- core
|  |- workspaceGenerator.ts
|  |- gradleRunner.ts
|  |- javaValidator.ts
|  \- versions.ts
|- utils
|  \- fs.ts
\- extension.ts
```

## Hoja de Ruta

Próximas funcionalidades planificadas:

- `Liferay: Create Module`
- `Liferay: Create Client Extension`
- `Liferay: Start Portal`
- mejoras en el panel de runtime del portal
- mejoras en el progreso de descarga
- detección más inteligente de cachés y bundles locales

## Por Qué Existe Este Proyecto

Las herramientas de configuración marcan una gran diferencia en el día a día. La propuesta aquí es ofrecer una experiencia más moderna para desarrolladores Liferay dentro de VS Code, reduciendo la fricción y dejando el entorno listo con menos pasos.

En otras palabras: menos configuración manual, más desarrollo.

## Estado

Proyecto en evolución activa.

Ya funciona para la creación de workspace, la ejecución de `initBundle`, la creación de client extensions y la gestión inicial del portal, con una estructura lista para crecer.

## Contribución

Las ideas, mejoras y sugerencias son muy bienvenidas. Si quieres hacer evolucionar este proyecto, siéntete libre de abrir un issue, proponer ajustes o ampliar los comandos existentes.

<p align="right"><a href="#liferay-dev-tools">Volver arriba</a></p>

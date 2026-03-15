# Liferay Workspace MVP

Crie workspaces Liferay 7.4 no VS Code em poucos passos, sem Blade CLI e sem depender de Gradle instalado globalmente.

## Visao Geral

O objetivo desta extensao e simplificar o setup de projetos Liferay diretamente no Visual Studio Code, com um fluxo guiado, rapido e previsivel.

Com esta extensao, voce pode:

- criar um novo Liferay Workspace
- escolher entre `Liferay DXP` e `Liferay Portal Community`
- selecionar a versao do produto
- gerar a estrutura padrao do workspace
- usar um `Gradle Wrapper` embutido
- validar o Java antes da execucao
- executar `initBundle` sem Blade CLI
- abrir o workspace automaticamente no VS Code

## Destaques

- Sem Blade CLI
- Sem Gradle global
- Fluxo guiado pela UI do VS Code
- Suporte para Liferay `7.4`
- Base pronta para evoluir para modulos, client extensions, deploy e start do portal

## Comandos Disponiveis

### `Liferay: Create Workspace`

Cria um novo workspace com:

- `gradlew` e `gradlew.bat`
- `gradle/wrapper`
- `settings.gradle`
- `gradle.properties`
- `.gitignore`
- pastas padrao do projeto

Fluxo:

1. Escolha a edicao do produto
2. Escolha a versao
3. Informe o nome do workspace
4. Escolha a pasta de destino
5. A extensao gera os arquivos
6. O Java e validado
7. O `Gradle Wrapper` e testado
8. O workspace pode ser aberto automaticamente

### `Liferay: Download Bundle`

Executa o `initBundle` no workspace aberto.

Esse comando:

- valida o Java
- roda o Gradle em tempo real
- mostra progresso visual durante a execucao
- envia logs para o canal `Liferay Workspace`

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

## Requisitos

- VS Code
- Java 17 configurado
- acesso a internet para baixar dependencias e bundles quando necessario

## Stack

- TypeScript
- VS Code Extension API
- Node.js `child_process`
- Gradle Wrapper
- Liferay Workspace Plugin

## Como Executar em Desenvolvimento

```bash
npm install
npm run compile
```

Depois:

1. abra o projeto no VS Code
2. pressione `F5`
3. uma nova janela de Extension Development Host sera aberta
4. execute os comandos da extensao pelo Command Palette

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

Proximas funcionalidades planejadas:

- `Liferay: Create Module`
- `Liferay: Create Client Extension`
- `Liferay: Deploy Module`
- `Liferay: Start Portal`
- melhorias no progresso do download
- deteccao mais inteligente de caches e bundles locais

## Por Que Este Projeto Existe

Ferramentas de setup fazem diferenca no dia a dia. A proposta aqui e entregar uma experiencia mais moderna para desenvolvedores Liferay dentro do VS Code, reduzindo friccao e deixando o ambiente pronto com menos passos.

Em outras palavras: menos configuracao manual, mais desenvolvimento.

## Status

Projeto em evolucao ativa.

Ja funciona para criacao de workspace e execucao do `initBundle`, com estrutura pronta para crescimento.

## Contribuicao

Ideias, melhorias e sugestoes sao muito bem-vindas. Se quiser evoluir este projeto, sinta-se a vontade para abrir issue, propor ajustes ou expandir os comandos existentes.

## Visao Final

Transformar esta extensao em algo proximo de um:

**Liferay Developer Tools for VS Code**

com suporte para:

- criar workspace
- criar modulos
- criar client extensions
- fazer deploy
- iniciar e gerenciar o portal

tudo isso sem depender do Blade CLI.

# __PROJECT_TITLE__

Client extension do tipo `customElement` usando Vue com Vite.

## O que editar

- `src/App.vue`: interface principal do widget.
- `src/main.js`: criacao e registro do web component.
- `client-extension.yaml`: nome da extensao, tag HTML e URL amigavel.

## Como usar com o Liferay

1. Dentro da pasta do projeto, execute `npm install`.
2. Rode `npm run build` para gerar os arquivos em `dist/`.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, adicione o widget da client extension em uma pagina e publique.
5. Se editar a tag do web component, mantenha o `htmlElementName` sincronizado com o registro em `src/main.js`.

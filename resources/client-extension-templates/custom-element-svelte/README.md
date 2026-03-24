# __PROJECT_TITLE__

Client extension do tipo `customElement` usando Svelte com Vite.

## O que editar

- `src/App.svelte`: interface e chamadas ao Liferay.
- `src/main.js`: registro do custom element.
- `client-extension.yaml`: nome da extensao, tag HTML e URL amigavel.

## Como usar com o Liferay

1. Dentro da pasta do projeto, execute `npm install`.
2. Rode `npm run build` para gerar os arquivos em `dist/`.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, adicione o widget da client extension em uma pagina e publique.
5. Se o componente consumir APIs do portal, teste com um usuario autenticado para validar permissoes e CORS.

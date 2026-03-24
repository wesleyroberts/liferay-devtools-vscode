# __PROJECT_TITLE__

Client extension do tipo `customElement` usando React com Vite.

## O que editar

- `src/main.jsx`: bootstrap do componente.
- `src/styles.css`: estilos do widget.
- `client-extension.yaml`: metadados e nome HTML do componente.

## Como usar com o Liferay

1. Dentro da pasta do projeto, execute `npm install`.
2. Rode `npm run build` para gerar os arquivos em `build/`.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, adicione o widget da client extension em uma pagina.
5. Sempre que rebuildar, publique novamente no workspace para atualizar o portal.

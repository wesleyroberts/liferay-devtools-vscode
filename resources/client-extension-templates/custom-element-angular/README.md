# __PROJECT_TITLE__

Client extension do tipo `customElement` com Angular.

## O que editar

- `src/main.ts`: definicao do web component Angular.
- `src/styles.css`: estilos globais do componente.
- `client-extension.yaml`: configuracao da client extension no Liferay.

## Como usar com o Liferay

1. Dentro da pasta do projeto, execute `npm install`.
2. Rode `npm run build` para gerar o bundle Angular.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, adicione o widget da client extension em uma pagina e publique.
5. Se mudar o nome do componente, mantenha `__CUSTOM_ELEMENT_TAG__` alinhado com o `htmlElementName` do `client-extension.yaml`.

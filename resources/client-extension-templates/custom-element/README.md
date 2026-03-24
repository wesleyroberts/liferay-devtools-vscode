# __PROJECT_TITLE__

Client extension do tipo `customElement` com assets estaticos.

## O que editar

- `assets/index.js`: comportamento do widget.
- `assets/style.css`: estilos do componente.
- `client-extension.yaml`: nome, tag HTML e metadados da extensao.

## Como usar com o Liferay

1. Ajuste os arquivos em `assets/`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy` para empacotar e publicar a client extension.
3. No portal, abra uma pagina, adicione o widget da client extension e publique a pagina.
4. Sempre que alterar os assets, execute o deploy novamente.

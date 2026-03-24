# __PROJECT_TITLE__

Client extension do tipo `globalCSS` com escopo `company`.

## O que editar

- `assets/global.css`: estilos globais da company.
- `client-extension.yaml`: nome e escopo da extensao.

## Como usar com o Liferay

1. Defina os estilos em `assets/global.css`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. Use esta opcao quando o CSS precisar valer para toda a instancia.
4. Teste em diferentes paginas para garantir que os estilos nao afetem componentes nativos do portal de forma indevida.

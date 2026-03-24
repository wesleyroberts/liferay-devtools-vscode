# __PROJECT_TITLE__

Client extension do tipo `globalCSS` com escopo `layout`.

## O que editar

- `assets/global.css`: estilos aplicados por pagina.
- `client-extension.yaml`: escopo e nome da extensao.

## Como usar com o Liferay

1. Defina os estilos em `assets/global.css`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. No portal, aplique a extensao nas paginas em que o CSS deve ficar ativo.
4. Esta opcao e util quando o estilo nao deve vazar para o restante do site.

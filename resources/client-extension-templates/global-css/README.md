# __PROJECT_TITLE__

Client extension do tipo `globalCSS` para injetar estilos no portal.

## O que editar

- `assets/global.css`: estilos compartilhados.
- `client-extension.yaml`: nome e configuracao da extensao.

## Como usar com o Liferay

1. Adicione os estilos em `assets/global.css`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. No portal, associe a client extension ao contexto desejado.
4. Prefira seletores bem especificos para evitar conflitos com o tema do Liferay.

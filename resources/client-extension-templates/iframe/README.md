# __PROJECT_TITLE__

Client extension do tipo `iframe` para incorporar uma aplicacao externa no portal.

## O que editar

- `client-extension.yaml`: principalmente a propriedade `url`.

## Como usar com o Liferay

1. Troque `https://example.com` pela URL da aplicacao que sera embutida.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. No portal, adicione o widget da client extension em uma pagina.
4. Garanta que a aplicacao externa aceite ser aberta em iframe e esteja acessivel pelo usuario final.

# __PROJECT_TITLE__

Client extension do tipo `globalJS` para executar JavaScript no portal.

## O que editar

- `assets/global.js`: script carregado pelo Liferay.
- `client-extension.yaml`: nome e configuracao da extensao.

## Como usar com o Liferay

1. Implemente a logica em `assets/global.js`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. No portal, habilite a client extension no contexto em que deseja executar o script.
4. Use este template quando quiser comportamento compartilhado sem criar um widget visual.

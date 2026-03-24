# __PROJECT_TITLE__

Client extension do tipo `globalJS` com escopo `company` e carregamento no `head`.

## O que editar

- `assets/global.js`: script global da instancia.
- `client-extension.yaml`: escopo, local de script e nome da extensao.

## Como usar com o Liferay

1. Implemente o script em `assets/global.js`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. Depois do deploy, a extensao podera ser aplicada no nivel da instancia, atingindo varios sites da mesma company.
4. Use com cuidado porque o codigo roda de forma ampla e pode impactar todo o portal.

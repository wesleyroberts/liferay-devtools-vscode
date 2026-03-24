# __PROJECT_TITLE__

Client extension do tipo `batch` para empacotar cargas do Batch Engine.

## O que editar

- `batch/`: arquivos `*.batch-engine-data.json` ou `*.batch-engine-data.jsont`.
- `client-extension.yaml`: definicao do batch e OAuth app headless.

## Como usar com o Liferay

1. Coloque seus arquivos de importacao na pasta `batch/`.
2. Ajuste os scopes do OAuth app em `client-extension.yaml` conforme os endpoints que serao usados.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. Use este template quando quiser automatizar carga de dados no portal por meio do Batch Engine.

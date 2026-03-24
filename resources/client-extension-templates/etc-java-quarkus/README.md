# __PROJECT_TITLE__

Client extension de microservico em Java com Quarkus para integracoes com o Liferay.

## O que editar

- `src/main/java/`: endpoints, filtros e regras de negocio.
- `src/main/resources/application.properties`: configuracoes do servico e OAuth.
- `client-extension.yaml`: OAuth app, object action e endereco do servico.

## Como usar com o Liferay

1. Ajuste o codigo e as propriedades do Quarkus.
2. Execute `./mvnw package` ou `mvnw.cmd package` para gerar o artefato.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. Use no portal em cenarios como object actions ou integracoes autenticadas com OAuth.
5. Se alterar porta, endpoint ou external reference code, mantenha `client-extension.yaml` e `application.properties` sincronizados.

# __PROJECT_TITLE__

Client extension de microservico em Spring Boot.

## O que editar

- `src/main/java/com/acme/sample/SampleApplication.java`: endpoints do servico.
- `src/main/resources/application.properties`: configuracoes da aplicacao.
- `client-extension.yaml`: OAuth app e endereco do servico.

## Como usar com o Liferay

1. Ajuste os endpoints e regras de negocio da aplicacao.
2. Dentro da pasta do projeto, execute `gradlew bootJar` para gerar o artefato.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. Use o microservico em integracoes autenticadas com o portal.
5. O endpoint `GET /ready` e util para health check e validacao de deploy.

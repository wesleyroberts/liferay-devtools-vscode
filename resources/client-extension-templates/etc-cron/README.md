# __PROJECT_TITLE__

Client extension de microservico Spring Boot voltada para rotinas agendadas.

## O que editar

- `src/main/java/com/acme/sample/SampleCronApplication.java`: logica da aplicacao.
- `src/main/resources/application.properties`: configuracoes do servico.
- `client-extension.yaml`: metadados e OAuth app da extensao.

## Como usar com o Liferay

1. Ajuste a rotina da aplicacao e as configuracoes necessarias.
2. Dentro da pasta do projeto, execute `gradlew bootJar` para gerar o artefato.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. Use este template quando quiser um servico de apoio ao portal que rode tarefas programadas ou fluxos internos.
5. Se a rotina chamar APIs do Liferay, confirme os escopos definidos no OAuth app do `client-extension.yaml`.

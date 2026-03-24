# __PROJECT_TITLE__

Client extension de microservico em Go para integracoes com o Liferay, como object actions.

## O que editar

- `main.go`: endpoints e logica do servico.
- `go.mod`: dependencias do projeto.
- `client-extension.yaml`: OAuth app, object action e endpoint exposto.

## Como usar com o Liferay

1. Ajuste a logica em `main.go`.
2. Execute `go mod tidy` se precisar atualizar dependencias.
3. Gere e teste localmente o servico conforme o fluxo do projeto.
4. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy` para publicar a client extension.
5. No portal, conecte a object action ao objeto desejado e valide a autenticacao via OAuth.

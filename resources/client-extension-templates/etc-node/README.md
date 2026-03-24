# __PROJECT_TITLE__

Client extension de microservico em Node.js.

## O que editar

- `src/server.js`: endpoints do servico.
- `build.mjs`: processo de build.
- `client-extension.yaml`: OAuth app e endereco do servico.

## Como usar com o Liferay

1. Dentro da pasta do projeto, execute `npm install`.
2. Use `npm run dev` para testes locais e `npm run build` para gerar `dist/`.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, conecte o servico ao caso de uso desejado, como chamadas autenticadas ou automacoes.
5. O endpoint `GET /ready` ajuda a validar se o servico esta respondendo corretamente.

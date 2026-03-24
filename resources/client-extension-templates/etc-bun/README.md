# __PROJECT_TITLE__

Client extension de microservico com Bun, pensada para integracoes como object actions.

## O que editar

- `src/index.ts`: rotas e logica principal.
- `dxp-metadata/`: configuracoes lidas pelo runtime da extensao.
- `client-extension.yaml`: OAuth app, object action e endereco do servico.

## Como usar com o Liferay

1. Instale o Bun no ambiente em que for executar o servico.
2. Dentro da pasta do projeto, execute `bun install` se necessario e use `bun run serve` para testes locais.
3. Ajuste a regra em `client-extension.yaml`, por exemplo a `objectAction` e o endpoint exposto.
4. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy` para empacotar a extensao.
5. No portal, associe a object action ao objeto desejado e valide se o OAuth app gerado tem os escopos corretos.

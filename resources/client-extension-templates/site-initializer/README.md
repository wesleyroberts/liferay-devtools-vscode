# __PROJECT_TITLE__

Client extension do tipo `siteInitializer` para criar um site inicial no Liferay.

## O que editar

- `site-initializer/`: estrutura, conteudo e arquivos exportados do site.
- `client-extension.yaml`: nome do site, ERC e OAuth app associado.

## Como usar com o Liferay

1. Coloque os arquivos do initializer dentro de `site-initializer/`.
2. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
3. No portal, crie um novo site e escolha este initializer na lista disponivel.
4. Use esta opcao quando quiser entregar um site base pronto, com paginas, conteudo e configuracoes iniciais.

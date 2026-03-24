# __PROJECT_TITLE__

Client extension de microservico em Python com FastAPI para integracoes com o Liferay.

## O que editar

- `main.py`: rotas e logica da aplicacao.
- `pyproject.toml`: dependencias Python.
- `client-extension.yaml`: OAuth app, object action e endereco do servico.

## Como usar com o Liferay

1. Crie o ambiente Python do projeto e instale as dependencias, por exemplo com `uv sync` ou `pip install -e .`.
2. Rode o servico localmente para validar as rotas e a autenticacao.
3. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
4. No portal, associe a extensao ao fluxo desejado, como object actions.
5. Se mudar porta ou external reference code, alinhe `main.py`, `client-extension.yaml` e `dxp-metadata/`.

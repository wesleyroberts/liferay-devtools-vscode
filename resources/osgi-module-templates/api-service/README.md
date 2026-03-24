# __PROJECT_TITLE__

Modulo OSGi multi-projeto com `API + Service`.

## Estrutura criada

- `__PROJECT_NAME__-api`: expoe a interface publica do servico.
- `__PROJECT_NAME__-service`: implementa a interface como componente OSGi.

## Como usar com o Liferay

1. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
2. Injete a interface `__CLASS_PREFIX__Service` em outros modulos OSGi.
3. Coloque contratos estaveis no modulo `-api` e regras de negocio no `-service`.

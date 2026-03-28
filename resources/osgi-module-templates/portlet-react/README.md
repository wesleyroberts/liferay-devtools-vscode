# __PROJECT_TITLE__

Modulo OSGi do tipo `Portlet React`.

## O que editar

- `src/main/java/__PACKAGE_PATH__/web/portlet/__CLASS_PREFIX__ReactPortlet.java`: classe principal do portlet.
- `src/main/webapp/view.jsp`: marca o ponto de montagem do React.
- `src/main/webapp/js/main.js`: componente React renderizado no portal.

## Como usar com o Liferay

1. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
2. No portal, adicione o portlet `__PROJECT_TITLE__ React`.
3. Evolua o JSX/React em `main.js` usando os modulos React carregados pelo `Liferay.Loader`.

# __PROJECT_TITLE__

Modulo OSGi do tipo `MVC Portlet`.

## O que editar

- `src/main/java/__PACKAGE_PATH__/web/portlet/__CLASS_PREFIX__Portlet.java`: classe principal do portlet.
- `src/main/webapp/view.jsp`: interface inicial renderizada no portal.
- `src/main/resources/content/Language.properties`: textos do modulo.

## Como usar com o Liferay

1. No workspace, execute `gradlew deploy` ou `gradlew.bat deploy`.
2. No portal, abra uma pagina e adicione o portlet `__PROJECT_TITLE__`.
3. Atualize o JSP e a classe Java conforme a regra de negocio do modulo.

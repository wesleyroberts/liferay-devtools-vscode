(function () {
    const scriptElement = document.currentScript;

    if (!scriptElement) {
        return;
    }

    const rootElement = scriptElement.previousElementSibling;

    if (!rootElement) {
        return;
    }

    const projectTitle = rootElement.dataset.projectTitle || "__PROJECT_TITLE__";

    Liferay.Loader.require(
        "frontend-js-react-web$react",
        "frontend-js-react-web$react-dom",
        function (React, ReactDOM) {
            const heading = React.createElement(
                "h2",
                { className: "mb-3" },
                projectTitle
            );

            const description = React.createElement(
                "p",
                null,
                "Este sample monta um portlet React usando os modulos ja carregados pelo portal."
            );

            const button = React.createElement(
                "button",
                {
                    className: "btn btn-primary",
                    onClick: function () {
                        Liferay.Util.openToast({
                            message: "Hello from " + projectTitle,
                            type: "success"
                        });
                    },
                    type: "button"
                },
                "Testar React Portlet"
            );

            const content = React.createElement(
                "div",
                { className: "container-fluid py-3" },
                heading,
                description,
                button
            );

            ReactDOM.render(content, rootElement);
        },
        function (error) {
            console.error("Nao foi possivel carregar React para o portlet", error);
        }
    );
})();

(function () {
  "use strict";

  class AppElement extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="app-shell">
          <h2>__PROJECT_TITLE__</h2>
          <p>Seu custom element foi criado com sucesso.</p>
          <button type="button" class="app-button">Clique aqui</button>
          <p class="app-status">Aguardando interacao...</p>
        </div>
      `;

      const button = this.querySelector(".app-button");
      const status = this.querySelector(".app-status");

      button?.addEventListener("click", () => {
        if (status) {
          status.textContent = "Evento executado dentro do custom element.";
        }
      });
    }
  }

  if (!customElements.get("__CUSTOM_ELEMENT_TAG__")) {
    customElements.define("__CUSTOM_ELEMENT_TAG__", AppElement);
  }
})();

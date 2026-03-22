import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { Component, Injector } from "@angular/core";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
    <div class="app-shell">
      <h2>__PROJECT_TITLE__</h2>
      <p>Starter Angular para client extension.</p>
    </div>
  `
})
class AppComponent {}

async function bootstrap() {
  const app = await createApplication({
    providers: []
  });

  const element = createCustomElement(AppComponent, {
    injector: app.injector as Injector
  });

  if (!customElements.get("__CUSTOM_ELEMENT_TAG__")) {
    customElements.define("__CUSTOM_ELEMENT_TAG__", element);
  }
}

bootstrap();

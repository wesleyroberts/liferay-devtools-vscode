import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <div className="app-shell">
      <h2>__PROJECT_TITLE__</h2>
      <p>Starter React Vite para client extension.</p>
    </div>
  );
}

class ProjectElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this);
    root.render(<App />);
  }
}

if (!customElements.get("__CUSTOM_ELEMENT_TAG__")) {
  customElements.define("__CUSTOM_ELEMENT_TAG__", ProjectElement);
}

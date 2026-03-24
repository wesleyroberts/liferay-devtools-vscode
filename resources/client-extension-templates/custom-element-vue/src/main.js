import {createApp} from 'vue'
import App from './App.vue'

const ELEMENT_ID = '__CUSTOM_ELEMENT_TAG__';

class WebComponent extends HTMLElement {
  connectedCallback() {
    createApp(App).mount(this);
  }
}

if (!customElements.get(ELEMENT_ID)) {
  customElements.define(ELEMENT_ID, WebComponent);
}

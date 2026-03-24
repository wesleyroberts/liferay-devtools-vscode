import App from './App.svelte'

const ELEMENT_ID = '__CUSTOM_ELEMENT_TAG__';

if (!customElements.get(ELEMENT_ID)) {
  customElements.define(ELEMENT_ID, App.element);
}

export function define(tagName) {
  return function(constructor) {
    customElements.define(tagName, constructor);
  };
}
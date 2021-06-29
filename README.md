# lit-svelte-stores

Lit controller to use svelte stores as state management.

## Usage

```js
import { LitElement, html } from "lit";
import { writable } from "svelte/store";
import { SvelteStoreController } from "lit-svelte-store";

const store = writable(0);

setInterval(() => {
  store.update((count) => count + 1);
}, 1000);

class SampleElement extends LitElement {
  constructor() {
    super();
    this.store = new SvelteStoreController(this, store);
  }

  render() {
    return html`Count: ${this.store.value}`;
  }
}
```

See a full working example in `demo/index.html`.

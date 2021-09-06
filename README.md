# lit-svelte-stores

Lit controller to use svelte stores as state management.

## Usage

### Decorator 

> Decorators only work in typescript.

```ts
import { LitElement, html } from "lit";
import { writable } from "svelte/store";
import { fromStore } from "lit-svelte-stores";

const store = writable(0);

setInterval(() => {
  store.update((count) => count + 1);
}, 1000);

class SampleElement extends LitElement {
  @fromStore(store)
  count!: number;

  render() {
    return html`Count: ${this.count}`;
  }
}
```

### Controller

```js
import { LitElement, html } from "lit";
import { writable } from "svelte/store";
import { StoreController } from "lit-svelte-stores";

const store = writable(0);

setInterval(() => {
  store.update((count) => count + 1);
}, 1000);

class SampleElement extends LitElement {
  constructor() {
    super();
    this.store = new StoreController(this, store);
  }

  render() {
    return html`Count: ${this.store.value}`;
  }
}
```

## Demo

See a full working example in `demo/index.html`.

# lit-svelte-stores

Lit controller to use svelte stores as state management.

## Usage

```js
import { LitElement, html } from "lit";
import { writable } from "svelte/store";
import { StoreSubscriber } from "lit-svelte-stores";

const store = writable(0);

setInterval(() => {
  store.update((count) => count + 1);
}, 1000);

class SampleElement extends LitElement {
  constructor() {
    super();
    this.store = new StoreSubscriber(this, () => store);
  }

  render() {
    return html`Count: ${this.store.value}`;
  }
}
```

This will trigger a re-render every time the store emits a new value.

### Changing the store

If your store changes during the element lifecycle, you can just return a different one in the initialization callback:

```js
import { LitElement, html } from "lit";
import { get, readable, writable } from "svelte/store";
import { StoreSubscriber } from "lit-svelte-stores";

let store = writable(0);

let store2 = readable(5000);

class SampleElement extends LitElement {
  static get properties() {
    return {
      loaded: {
        type: Boolean,
      },
    };
  }

  constructor() {
    super();
    this.store = new StoreSubscriber(this, () => (!this.loaded ? store : store2));

    setTimeout(() => {
      this.loaded = true;
    }, 2000);
  }

  render() {
    return html`Is loaded: ${this.store.value}`;
  }
}
```

### Being careful with resubscribing

In a lot of use-cases, you want to carefully control when the store gets subscribed to again, to avoid multiple unnecessary element updates.

Imagine we want to recreate a store only when a property in our element changes:

```js
import { LitElement, html } from "lit";
import { get, readable, writable } from "svelte/store";
import { StoreSubscriber } from "lit-svelte-stores";

function fetchAuthor(authorId) {
  return readable('loading', set => {
    fetch(`https://some/url/${authorId}`).then(set)
  })
}

class SampleElement extends LitElement {
  static get properties() {
    return {
      authorId: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.store = new StoreSubscriber(
      this, 
      () => fetchAuthor(this.authorId), // This will be executed any time `this.authorId` changes
      () => [this.authorId]
    );
  }

  render() {
    return html`Author: ${this.store.value}`;
  }
}
```

## Demo

See a full working example in `demo/index.html`.

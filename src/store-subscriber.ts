import { Readable, Unsubscriber } from "svelte/store";
import { ReactiveController, ReactiveElement } from "lit";

/**
 * Tracks a changing store, derived at each update
 */
export class StoreSubscriber<V> implements ReactiveController {
  value!: V;

  public _unsubscribe: Unsubscriber | undefined;

  private _previousStore: Readable<V> | undefined;

  constructor(
    protected host: ReactiveElement,
    protected getStore: () => Readable<V>
  ) {
    host.addController(this);
  }

  hostUpdate() {
    this.resubscribe();
  }

  hostDisconnected() {
    this.unsubscribe();
  }

  unsubscribe() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = undefined;
    }
  }

  resubscribe() {
    const store = this.getStore();

    if (store !== this._previousStore) {
      this.unsubscribe();

      if (store) {
        this._unsubscribe = store.subscribe((value) => {
          if (value !== this.value) {
            this.value = value;
            this.host.requestUpdate();
          }
        });
      }
    }

    this._previousStore = store;
  }
}

import { Readable, Unsubscriber, get } from "svelte/store";
import { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Tracks a changing store, derived at each update
 */
export class StoreSubscriber<V> implements ReactiveController {
  value!: V;

  public _unsubscribe: Unsubscriber | undefined;

  private _previousStore: Readable<V> | undefined;

  constructor(
    protected host: ReactiveControllerHost,
    protected getStore: () => Readable<V> | undefined
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

  shouldResubscribe(store: Readable<V> | undefined) {
    if (store === this._previousStore) return false;
    if (store && this._previousStore && get(store) === this.value) return false;
    return true;
  }

  store() {
    return this.getStore();
  }

  resubscribe() {
    const store = this.store();

    if (this.shouldResubscribe(store)) {
      this.unsubscribe();

      if (store) {
        this._unsubscribe = store.subscribe((value) => {
          this.value = value;
          this.host.requestUpdate();
        });
      }
      this._previousStore = store;
    }
  }
}

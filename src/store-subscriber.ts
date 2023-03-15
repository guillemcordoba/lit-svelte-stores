import { Readable, Unsubscriber, get } from "svelte/store";
import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import isEqual from "lodash-es/isEqual.js";

/**
 * Subscribes to a readable store
 *
 * If resubscribeIfChanged is given, it will only resubscribe when the values returned by that function change
 * If it is not given, it will check at every host update if the store value has changed and resubscribe if so
 */
export class StoreSubscriber<V> implements ReactiveController {
  value!: V;

  public _unsubscribe: Unsubscriber | undefined;

  private _previousStore: Readable<V> | undefined;
  private _previousArgs: Array<any> | undefined;

  constructor(
    protected host: ReactiveControllerHost,
    protected getStore: () => Readable<V> | undefined,
    protected resubscribeIfChanged?: () => Array<any>,
    protected notifyPropertyName?: string
  ) {
    host.addController(this);
  }

  hostUpdate() {
    const store = this.store();

    if (this.shouldResubscribe(store)) {
      this.unsubscribe();

      if (store) {
        this._unsubscribe = store.subscribe((value) => {
          const prevValue = this.value
          this.value = value;
          this.notify(this.notifyPropertyName || 'value', this.notifyPropertyName ? { value: prevValue } : prevValue);
        });
      }
      this._previousStore = store;
    }
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
    if (this.resubscribeIfChanged) {
      const args = this.resubscribeIfChanged();
      const prev = this._previousArgs;
      this._previousArgs = args;
      return !isEqual(args, prev);
    } else {
      if (store === this._previousStore) return false;
      if (store && this._previousStore && get(store) === this.value)
        return false;
      return true;
    }
  }

  store() {
    return this.getStore();
  }

  protected notify(key: string, value: unknown): void {
    if (this.host.requestUpdate.length > 0) {
      (this.host as ReactiveElement).requestUpdate(key, value);
    } else {
      this.host.requestUpdate();
    }
  }
}

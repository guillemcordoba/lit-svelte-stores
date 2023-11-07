import { Readable, Unsubscriber } from "svelte/store";
import { ReactiveController, ReactiveControllerHost } from "lit";
import isEqual from "lodash-es/isEqual.js";

/**
 * Subscribes to a readable store
 *
 * If resubscribeIfChanged is given, it will only resubscribe when the values returned by that function change
 * If it is not given, it will check at every host update if the store value has changed and resubscribe if so
 */
export class StoreSubscriber<V> implements ReactiveController {
  value!: V;
  store!: Readable<V>;

  public _unsubscribe: Unsubscriber | undefined;

  private _previousArgs: Array<any> | undefined;

  constructor(
    protected host: ReactiveControllerHost,
    protected getStore: () => Readable<V>,
    protected resubscribeIfChanged?: () => Array<any>
  ) {
    if (!this.resubscribeIfChanged) {
      // Try to infer as best as possible
      const getStoreFn = this.getStore.toString();

      const matches = getStoreFn.matchAll(
        /[^\_\$a-zA-Z0-9]this\.([\$\_a-zA-Z0-9]+)/gm
      );

      const propertyKeys = [...matches].map((match) => match[1]);

      this.resubscribeIfChanged = () =>
        propertyKeys.map((key) => this.host[key]);
    }
    host.addController(this);
  }

  hostUpdate() {
    if (this.shouldResubscribe()) {
      this.store = this.getStore();
      this.unsubscribe();

      if (this.store) {
        this._unsubscribe = this.store.subscribe((value) => {
          this.value = value;
          this.host.requestUpdate();
        });
      }
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

  shouldResubscribe() {
    const args = this.resubscribeIfChanged!();
    const prev = this._previousArgs;
    this._previousArgs = args;
    return !isEqual(args, prev);
  }
}

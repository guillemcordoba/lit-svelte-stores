import { Readable, Unsubscriber } from "svelte/store";
import { ReactiveController, ReactiveElement } from "lit";

export class StoreController<T> implements ReactiveController {
  value!: T;

  private _unsubscribe!: Unsubscriber;

  constructor(
    protected host: ReactiveElement,
    protected store: Readable<T>,
    protected callback?: (value: T) => any
  ) {
    host.addController(this);
  }

  hostConnected() {
    this._unsubscribe = this.store.subscribe((value) => {
      this.value = value;
      if (this.callback) this.callback(value);
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this._unsubscribe();
  }
}

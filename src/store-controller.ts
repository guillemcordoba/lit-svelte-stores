import { Readable, Unsubscriber } from "svelte/store";
import { LitElement, ReactiveController } from "lit";

export class StoreController<T> implements ReactiveController {
  value!: T;

  private _unsubscribe!: Unsubscriber;

  constructor(protected host: LitElement, protected store: Readable<T>) {
    host.addController(this);
  }

  hostConnected() {
    this._unsubscribe = this.store.subscribe((value) => {
      this.value = value;
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this._unsubscribe();
  }
}

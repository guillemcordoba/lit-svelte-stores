import { ReactiveController, ReactiveControllerHost } from "lit";
import { Readable } from "svelte/store";
import { StoreSubscriber } from "./store-subscriber";

export class TaskSubscriber<V>
  extends StoreSubscriber<V>
  implements ReactiveController
{
  _store: Readable<V> | undefined;

  _init = false;

  loading: boolean = true;
  error: any = undefined;

  constructor(
    protected host: ReactiveControllerHost,
    protected task: () => Promise<Readable<V>>
  ) {
    super(host, () => undefined);
  }

  hostUpdated() {
    if (this._init) return;

    this.task()
      .then((s) => {
        this._store = s;
        this.loading = false;
      })
      .catch((e) => (this.error = e))
      .finally(() => this.host.requestUpdate());
    this._init = true;
  }

  store() {
    return this._store;
  }
}

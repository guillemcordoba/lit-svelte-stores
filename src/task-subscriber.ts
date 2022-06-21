import { ReactiveController, ReactiveControllerHost } from "lit";
import { Readable } from "svelte/store";
import { StoreSubscriber } from "./store-subscriber";
import { ArgsFunction, StatusRenderer, Task, TaskStatus } from "@lit-labs/task";

export class TaskSubscriber<ARGS extends [...unknown[]], V>
  extends Task<ARGS, V>
  implements ReactiveController
{
  _storeSubscriber: StoreSubscriber<V> | undefined;
  _init = false;

  constructor(
    protected host: ReactiveControllerHost,
    protected task: (args: ARGS) => Promise<Readable<V>>,
    protected args?: ArgsFunction<ARGS>
  ) {
    super(
      host,
      (a: ARGS) => this.runAndSubscribe(a) as unknown as Promise<V>,
      args
    );
  }

  async hostUpdated() {
    super.hostUpdated();

    if (!this._init) {
      this._init = true;
      const args = this.args?.();
      await this.run(args);
    }
  }

  async runAndSubscribe(args: ARGS): Promise<Readable<V>> {
    if (this._storeSubscriber) {
      this._storeSubscriber.unsubscribe();
    }

    const store = await this.task(args);
    this._storeSubscriber = new StoreSubscriber(this.host, () => store);

    return store;
  }

  get value(): V | undefined {
    return this._storeSubscriber?.value;
  }

  render(renderer: StatusRenderer<V>) {
    if (this.status === TaskStatus.COMPLETE)
      return renderer.complete?.(this._storeSubscriber!.value);
    else super.render(renderer as any);
  }
}

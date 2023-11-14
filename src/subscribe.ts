import { directive, DirectiveResult } from "lit/directive.js";
import { AsyncDirective } from "lit/async-directive.js";
import { TemplateResult } from "lit";

import { get, Readable } from "svelte/store";

class SubscribeDirective extends AsyncDirective {
  private __store?: Readable<any>;
  private __unsubscribe?: () => void;
  private __template?: (value: any) => TemplateResult;

  override render<T>(
    store: Readable<T>,
    template: (value: T) => TemplateResult
  ) {
    if (store !== this.__store) {
      this.__unsubscribe?.();
      this.__store = store;
      this.__template = template;

      this.__unsubscribe = store.subscribe((value) => {
        // The subscribe() callback is called synchronously during subscribe.
        // Ignore the first call since we return the value below in that case.
        this.setValue(template(value));
      });
    }

    return template(get(this.__store));
  }

  protected override disconnected(): void {
    this.__unsubscribe?.();
  }

  protected override reconnected(): void {
    // Since we disposed the subscription in disconnected() we need to
    // resubscribe here. We don't ignore the synchronous callback call because
    // the signal might have changed while the directive is disconnected.
    //
    // There are two possible reasons for a disconnect:
    //   1. The host element was disconnected.
    //   2. The directive was not rendered during a render
    // In the first case the element will not schedule an update on reconnect,
    // so we need the synchronous call here to set the current value.
    // In the second case, we're probably reconnecting *because* of a render,
    // so the synchronous call here will go before a render call, and we'll get
    // two sets of the value (setValue() here and the return in render()), but
    // this is ok because the value will be dirty-checked by lit-html.
    this.__unsubscribe = this.__store?.subscribe((value) => {
      this.setValue(this.__template!(value));
    });
  }
}

/**
 * Renders a signal and subscribes to it, updating the part when the store
 * changes.
 */
export const subscribe = directive(SubscribeDirective) as <T>(
  store: Readable<T>,
  template: (value: T) => TemplateResult
) => DirectiveResult<typeof SubscribeDirective>;

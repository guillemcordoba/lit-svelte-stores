import { LitElement } from "lit";
import { readable } from "svelte/store";
import type { Readable } from "svelte/store";
import { Context, ContextConsumer } from "@lit-labs/context";

export function contextProvidedStore<CTX>(
  element: LitElement,
  context: Context<CTX>,
  multiple: boolean = true
): Readable<CTX> {
  return readable<CTX>(undefined, (set) => {
    element.addController(
      new ContextConsumer(
        element,
        context,
        (value: CTX) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
          set(value);
        },
        multiple
      )
    );
  });
}

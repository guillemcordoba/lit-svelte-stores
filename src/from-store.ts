import { ReactiveElement } from "@lit/reactive-element";
import { Readable } from "svelte/store";
import { decorateProperty } from "@lit/reactive-element/decorators/base.js";
import { StoreController } from "./store-controller";

export function fromStore<V>(store: Readable<V>): <K extends PropertyKey>(
  protoOrDescriptor: ReactiveElement & Record<K, V>,
  name?: K
  // Note TypeScript requires the return type to be `void|any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => void | any {
  return decorateProperty({
    finisher: (ctor: typeof ReactiveElement, name: PropertyKey) => {
      ctor.addInitializer((element: ReactiveElement): void => {
        element.addController(
          new StoreController(element, store, (value: V) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
            (element as any)[name] = value;
          })
        );
      });
    },
  });
}

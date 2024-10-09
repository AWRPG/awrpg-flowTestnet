import {
  defineQuery,
  Entity,
  Has,
  Component,
  ComponentValue,
  Schema,
  isComponentUpdate,
} from "@latticexyz/recs";

export function listenComponentValue<S extends Schema>(
  component: Component<S>,
  entity: Entity | undefined,
  callback: (value: unknown) => void
) {
  const queryResult = defineQuery([Has(component)], {
    runOnInit: true,
  });
  const subscription = queryResult.update$.subscribe((update) => {
    if (isComponentUpdate(update, component) && update.entity === entity) {
      const [nextValue] = update.value;
      callback(nextValue);
    }
  });

  return () => subscription.unsubscribe();
}

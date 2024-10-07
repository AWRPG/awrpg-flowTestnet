import { UIBase } from "./common/UIBase";
import { Component, Entity, Schema } from "@latticexyz/recs";
import { listenComponentValue } from "../../../utils/listenComponetValue";
import { ClientComponents } from "../../../mud/createClientComponents";

declare module "./common/UIBase" {
  interface UIBase {
    /** [Readonly] The entity bound to this UI. Use 'setEntity()' if you need to change it. */
    _entity?: Entity | undefined;
    get entity(): Entity | undefined;
    set entity(value: Entity | undefined);

    /** [Readonly] The components bound to this UI. Default to the components of scene. Use 'setEntity()' if you need to change it. */
    _components: ClientComponents;
    get components(): ClientComponents;
    set components(value: ClientComponents);

    /** For the Subscriptions if the game need to use */
    unsubscribes?: (() => void)[];

    /** Listener for AWRPG */
    listenComponentValue<S extends Schema>(
      component: Component<S>,
      callback: (value: unknown) => void,
      index?: number
    ): void;
  }
}

Object.defineProperty(UIBase.prototype, "entity", {
  get: function (): Entity | undefined {
    return this._entity;
  },
  set: function (value: Entity | undefined) {
    this._entity = value;
  },
});

Object.defineProperty(UIBase.prototype, "components", {
  get: function (): ClientComponents {
    return this._components;
  },
  set: function (value: ClientComponents) {
    this._components = value;
  },
});

/**
 * Extend init
 */
const originalInit = UIBase.prototype.init;
UIBase.prototype.init = function () {
  originalInit.call(this);
  this.unsubscribes = [];
  this.components = (this.scene as any).components;
};

/**
 * Listener for AWRPG
 * @callback
 * @index the index of the subscription to listen, default 0
 */
UIBase.prototype.listenComponentValue = function <S extends Schema>(
  component: Component<S>,
  callback: (value: unknown) => void,
  index: number = 0
) {
  if (!this.unsubscribes) return;
  if (this.unsubscribes[index]) this.unsubscribes[index]();
  this.unsubscribes[index] = listenComponentValue(
    component,
    this.entity,
    callback
  );
};

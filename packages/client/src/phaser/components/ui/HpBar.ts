import { UISlider, UISliderConfig } from "./common/UISlider";
import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { ClientComponents } from "../../../mud/createClientComponents";
import { getPoolAmount, getPoolCapacity } from "../../../logics/pool";
import { POOL_TYPES } from "../../../constants";

export class HpBar extends UISlider {
  private _px: unknown = null;

  constructor(scene: Phaser.Scene, config: UISliderConfig = {}) {
    super(scene, "bar_empty", "bar_red", null, config);
  }

  updateComponentValues() {
    console.log("updateComponentValues");
    if (!this.components || !this.entity) return;
    this.max = Number(
      getPoolCapacity(this.components, this.entity as Hex, POOL_TYPES[2])
    );
    this.value = Number(
      getPoolAmount(this.components, this.entity as Hex, POOL_TYPES[2])
    );
  }

  get px() {
    return this._px;
  }

  set px(value: unknown) {
    this._px = value;
    this.updateComponentValues();
  }

  get entity() {
    return super.entity;
  }

  set entity(value: Entity | undefined) {
    super.entity = value;
    this.listenComponentValue(this.components.Path, (nextValue) => {
      this.px = nextValue;
    });
  }
}

import { UISlider, UISliderConfig } from "./common/UISlider";
import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { getPoolAmount, getPoolCapacity } from "../../../logics/pool";
import { POOL_TYPES } from "../../../constants";

export class HpBar extends UISlider {
  constructor(scene: Phaser.Scene, config: UISliderConfig = {}) {
    super(scene, "bar_empty", "bar_red", null, config);
  }

  updateComponentValues(entity?: Entity) {
    if (!this.components || !this.entity) return;
    if (entity && entity !== this.entity) return;
    this.max = Number(
      getPoolCapacity(this.components, this.entity as Hex, POOL_TYPES[2])
    );
    this.value = Number(
      getPoolAmount(this.components, this.entity as Hex, POOL_TYPES[2])
    );
  }

  get entity() {
    return super.entity;
  }

  set entity(value: Entity | undefined) {
    super.entity = value;
    this.updateComponentValues();
  }
}

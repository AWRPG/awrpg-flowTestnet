import { UISlider, UISliderConfig } from "./common/UISlider";

export class SpBar extends UISlider {
  constructor(scene: Phaser.Scene, config: UISliderConfig = {}) {
    super(scene, "bar_empty", "bar_yellow", null, config);
  }
}

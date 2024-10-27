import { UIImage } from "./UIImage";
import { UIBase } from "./UIBase";
import { UIText, UITextConfig } from "./UIText";
import { ALIGNMODES } from "../../../../constants";

export interface UIButtonConfig extends UITextConfig {
  text?: string;
  skinTexture?: string;
  nineSlice?: number | number[];
  hoverSkinTexture?: string;
  hoverSkinNineSlice?: number | number[];
  clickedSkinTexture?: string;
  clickedSkinNineSlice?: number | number[];
}

export class UIButton extends UIBase {
  skin: UIImage;
  hoverSkin: UIImage;
  clickedSkin: UIImage;
  content: UIText;

  constructor(scene: Phaser.Scene, config: UIButtonConfig = {}) {
    config.skinTexture = config.skinTexture ?? "ui-empty";
    super(scene, { texture: config.skinTexture, ...config });

    config.alignModeName = undefined;
    config.marginX = 0;
    config.marginY = 0;
    config.parent = this;

    this.skin = this.initSkin(config);
    this.hoverSkin = this.initHoverSkin(config);
    this.hoverSkin.hidden();
    this.clickedSkin = this.initClickedSkin(config);
    this.clickedSkin.hidden();
    this.content = this.initContent(config);
  }

  initSkin(config: UIButtonConfig): UIImage {
    const texture = config.skinTexture!;
    return new UIImage(this.scene, texture, config);
  }

  initHoverSkin(config: UIButtonConfig): UIImage {
    const texture = config.hoverSkinTexture ?? config.skinTexture!;
    config.nineSlice = config.hoverSkinNineSlice ?? config.nineSlice;
    return new UIImage(this.scene, texture, config);
  }

  initClickedSkin(config: UIButtonConfig): UIImage {
    const texture = config.clickedSkinTexture ?? config.skinTexture!;
    config.nineSlice = config.clickedSkinNineSlice ?? config.nineSlice;
    return new UIImage(this.scene, texture, config);
  }

  initContent(config: UIButtonConfig): UIText {
    config.alignModeName = ALIGNMODES.LEFT_CENTER;
    return new UIText(this.scene, config.text ?? "", config);
  }

  onSelected() {
    super.onSelected();
    this.clickedSkin.show();
    this.skin.hidden();
    this.hoverSkin.hidden();
  }

  onUnSelected() {
    super.onUnSelected();
    if (this.hovering) {
      this.hoverSkin.show();
      this.skin.hidden();
    } else {
      this.skin.show();
      this.hoverSkin.hidden();
    }
    this.clickedSkin.hidden();
  }

  get skinTexture() {
    return this.skin.texture ?? "";
  }

  set skinTexture(value: string) {
    this.skin.setTexture(value);
  }

  get hoverSkinTexture() {
    return this.hoverSkin?.texture ?? "";
  }

  set hoverSkinTexture(value: string) {
    this.hoverSkin?.setTexture(value);
  }

  get clickedSkinTexture() {
    return this.clickedSkin?.texture ?? "";
  }

  set clickedSkinTexture(value: string) {
    this.clickedSkin?.setTexture(value);
  }
}

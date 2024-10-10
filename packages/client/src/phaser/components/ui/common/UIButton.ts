import { UIImage } from "./UIImage";
import { UIBase } from "./UIBase";
import { UIText, UITextConfig } from "./UIText";
import { ALIGNMODES } from "../../../../constants";

export interface UIButtonConfig extends UITextConfig {
  text?: string;
  skinTexture?: string;
  skinNineSlice?: number | number[];
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

    this.skin = this.initSkin(config);
    this.hoverSkin = this.initHoverSkin(config);
    // this.hoverSkin.hidden();
    this.clickedSkin = this.initClickedSkin(config);
    this.clickedSkin.hidden();
    this.content = this.initContent(config);
  }

  initSkin(config: UIButtonConfig): UIImage {
    return new UIImage(this.scene, config.skinTexture!, {
      parent: this,
      nineSlice: config.skinNineSlice,
      ...config,
    });
  }

  initHoverSkin(config: UIButtonConfig): UIImage {
    return new UIImage(
      this.scene,
      config.hoverSkinTexture ?? config.skinTexture!,
      {
        parent: this,
        nineSlice: config.hoverSkinNineSlice ?? config.skinNineSlice,
        ...config,
      }
    );
  }

  initClickedSkin(config: UIButtonConfig): UIImage {
    return new UIImage(
      this.scene,
      config.clickedSkinTexture ?? config.skinTexture!,
      {
        parent: this,
        nineSlice: config.clickedSkinNineSlice ?? config.skinNineSlice,
        ...config,
      }
    );
  }

  initContent(config: UIButtonConfig): UIText {
    console.log("initContent:", config.width, config.height);
    return new UIText(this.scene, config.text ?? "", {
      ...config,
      alignModeName: config.alignModeName ?? ALIGNMODES.LEFT_CENTER,
      parent: this,
    });
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

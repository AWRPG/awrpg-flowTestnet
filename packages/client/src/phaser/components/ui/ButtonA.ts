import { UIButton, UIButtonConfig } from "./common/UIButton";
import { UIImage } from "./common/UIImage";
import { UIText } from "./common/UIText";
import { ALIGNMODES } from "../../../constants";
import { BookListText } from "./BookListText";

export class ButtonA extends UIButton {
  constructor(scene: Phaser.Scene, config: UIButtonConfig = {}) {
    super(scene, {
      width: 260,
      height: 48,
      fontFamily: "ThaleahFat",
      fontSize: 36,
      fontStyle: "600",
      fontColor: "#2D3E51",
      hoverSkinTexture: "btn_select_skin",
      clickedSkinTexture: "btn_select_skin",
      nineSlice: 16,
      ...config,
    });

    if (this.disable) this.alpha = 0.5;

    // Underline
    new UIImage(scene, "btn_decor1", {
      width: this.content.textObj.width / 4,
      height: 2,
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      marginX: 82,
      nineSlice: [16, 16, 0, 0],
      parent: this,
    });

    // Circle
    new UIImage(scene, "btn_decor3", {
      width: 24,
      height: 24,
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: 40,
      parent: this,
    });

    // Circle naka
    new UIImage(scene, "btn_decor2", {
      width: 12,
      height: 12,
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: -22,
      parent: this.clickedSkin,
    });

    // Arrow
    const arrow = new UIImage(scene, "btn_decor4", {
      width: 32,
      height: 32,
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: -58,
      parent: this.clickedSkin,
    });
    scene.tweens.add({
      targets: arrow.root,
      x: arrow.x - 6,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });

    this.root.bringToTop(this.content.root);
  }

  initSkin(config: UIButtonConfig): UIImage {
    return super.initSkin({ ...config, marginX: 68 });
  }

  initHoverSkin(config: UIButtonConfig): UIImage {
    return super.initHoverSkin({ ...config, marginX: 68 });
  }

  initClickedSkin(config: UIButtonConfig): UIImage {
    return super.initClickedSkin({ ...config, marginX: 68 });
  }

  initContent(config: UIButtonConfig): UIText {
    return super.initContent({ ...config, marginX: 82 });
  }
}

import { UIButton, UIButtonConfig } from "./common/UIButton";
import { UIImage, UIImageConfig } from "./common/UIImage";
import { UIText, UITextConfig } from "./common/UIText";
import { ALIGNMODES } from "../../../constants";
import { StandardGameSize } from "./common/UIBase";

export class BookListSkin extends UIImage {
  constructor(
    scene: Phaser.Scene,
    texture: string,
    config: UIImageConfig = {}
  ) {
    super(scene, texture, config);
    // this.resizeListener(scene.game.scale.gameSize);
    // this.scene.scale.on("resize", this.resizeListener, this);
  }

  // resizeListener(gameSize: Phaser.Structs.Size) {
  //   const zoom = Phaser.Math.Clamp(
  //     gameSize.width / StandardGameSize.maxWidth,
  //     1600 / StandardGameSize.maxWidth,
  //     1
  //   );
  //   this.root.setDisplaySize(
  //     this.root.displayWidth,
  //     Math.ceil(this.naturalHeight / zoom)
  //   );
  //   this.updatePosition();
  // }
}

export class BookListButton extends UIButton {
  underline: UIImage;
  arrow: UIImage;
  constructor(scene: Phaser.Scene, config: UIButtonConfig = {}) {
    super(scene, {
      width: 260,
      height: 48,
      fontFamily: "ThaleahFat",
      fontSize: 24,
      fontStyle: "400",
      fontColor: "#2D3E51",
      hoverSkinTexture: "btn_select_skin",
      clickedSkinTexture: "btn_select_skin",
      nineSlice: 16,
      ...config,
    });

    if (this.disable) this.alpha = 0.5;

    // Underline
    this.underline = new UIImage(scene, "btn_decor1", {
      width: this.content.textObj.width / 4,
      height: 2,
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      marginX: 14,
      nineSlice: [16, 16, 0, 0],
      parent: this.skin,
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
    this.arrow = new UIImage(scene, "btn_decor4", {
      width: 32,
      height: 32,
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: -58,
      parent: this.clickedSkin,
    });
    scene.tweens.add({
      targets: this.arrow.root,
      x: this.arrow.x - 6,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });

    this.root.bringToTop(this.content.root);
  }

  initSkin(config: UIButtonConfig): BookListSkin {
    const texture = config.skinTexture!;
    return new BookListSkin(this.scene, texture, { ...config, marginX: 68 });
  }

  initHoverSkin(config: UIButtonConfig): BookListSkin {
    const texture = config.hoverSkinTexture ?? config.skinTexture!;
    config.nineSlice = config.hoverSkinNineSlice ?? config.nineSlice;
    return new BookListSkin(this.scene, texture, { ...config, marginX: 68 });
  }

  initClickedSkin(config: UIButtonConfig): BookListSkin {
    const texture = config.clickedSkinTexture ?? config.skinTexture!;
    config.nineSlice = config.clickedSkinNineSlice ?? config.nineSlice;
    return new BookListSkin(this.scene, texture, { ...config, marginX: 68 });
  }

  initContent(config: UIButtonConfig): UIText {
    config.alignModeName = ALIGNMODES.LEFT_CENTER;
    return new UIText(this.scene, config.text ?? "", {
      ...config,
      marginX: 82,
      antiZoom: true,
    });
  }
}

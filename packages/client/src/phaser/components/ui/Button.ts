import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";
import { Box } from "./Box";
import { UIText } from "./UIText";
import { ALIGNMODES } from "../../../constants";
import { UIImage } from "./UIImage";

export class Button extends UIBase {
  skin: Box;
  selectedSkin: Box;
  uiText: UIText;

  selectedTexture: string;

  constructor(
    scene: UIScene,
    texture: string,
    content: string,
    alignModeName: string,
    width: number = 128,
    height: number = 48,
    marginX: number = 0,
    marginY: number = 0,
    {
      fontSize = 24,
      fontColor = "#111",
      fontFamily = "Macondo",
      fontWeight = 600,
      wordWrap = undefined,
      leftWidth = 32,
      rightWidth = 32,
      topHeight = 32,
      bottomHeight = 32,
      leftWidth2 = 32,
      rightWidth2 = 32,
      topHeight2 = 32,
      bottomHeight2 = 32,
      selectedTexture = undefined,
      fontAlignMode = undefined,
    }: {
      fontSize?: number;
      fontColor?: string;
      fontFamily?: string;
      fontWeight?: number;
      wordWrap?: number | undefined;
      leftWidth?: number;
      rightWidth?: number;
      topHeight?: number;
      bottomHeight?: number;
      leftWidth2?: number;
      rightWidth2?: number;
      topHeight2?: number;
      bottomHeight2?: number;
      selectedTexture?: string | undefined;
      fontAlignMode?: string | undefined;
    },
    parent?: UIBase
  ) {
    super(
      scene,
      texture,
      alignModeName,
      width,
      height,
      marginX + 40,
      marginY,
      parent
    );
    this.selectedTexture = selectedTexture ?? texture;

    // Background (Default Skin)
    this.skin = new Box(
      scene,
      texture,
      fontAlignMode ?? ALIGNMODES.MIDDLE_CENTER,
      width,
      height,
      28,
      0,
      { leftWidth, rightWidth, topHeight, bottomHeight },
      this
    );

    // Background (Selected Skin)
    this.selectedSkin = new Box(
      scene,
      this.selectedTexture,
      fontAlignMode ?? ALIGNMODES.MIDDLE_CENTER,
      width,
      height,
      28,
      0,
      {
        leftWidth: leftWidth2,
        rightWidth: rightWidth2,
        topHeight: topHeight2,
        bottomHeight: bottomHeight2,
      },
      this
    );
    this.selectedSkin.hide();

    // Text
    this.uiText = new UIText(
      scene,
      content,
      fontAlignMode ?? ALIGNMODES.MIDDLE_CENTER,
      42,
      0,
      {
        fontSize,
        fontColor,
        fontFamily,
        fontWeight,
        wordWrap,
      },
      this
    );

    // Underline
    new Box(
      scene,
      "btn_decor1",
      ALIGNMODES.LEFT_BOTTOM,
      this.uiText.text.width / 4,
      2,
      42,
      0,
      { leftWidth: 16, rightWidth: 16, topHeight: 0, bottomHeight: 0 },
      this
    );

    // circle
    new UIImage(
      scene,
      "btn_decor3",
      ALIGNMODES.LEFT_CENTER,
      24,
      24,
      0,
      0,
      this
    );

    // circle naka
    new UIImage(
      scene,
      "btn_decor2",
      ALIGNMODES.LEFT_CENTER,
      12,
      12,
      -22,
      0,
      this.selectedSkin
    );

    // Arrow
    const arrow = new UIImage(
      scene,
      "btn_decor4",
      ALIGNMODES.LEFT_CENTER,
      32,
      32,
      -58,
      0,
      this.selectedSkin
    );
    scene.tweens.add({
      targets: arrow.root,
      x: arrow.x - 6,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
  }
}

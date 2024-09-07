import { UIScene } from "../../scenes/UIScene";
import { ALIGNMODES } from "../../../constants";
import { UIBase } from "../../components/ui/UIBase";
import { Box } from "../../components/ui/Box";
import { Button } from "../../components/ui/Button";
import { UIImage } from "../../components/ui/UIImage";

export class ButtonA extends Button {
  constructor(
    scene: UIScene,
    content: string,
    width: number = 128,
    height: number = 48,
    {
      alignModeName = ALIGNMODES.NONE,
      marginX = 0,
      marginY = 0,
      parent,
      fontSize = 36,
      fontColor = "#2D3E51",
      fontFamily = "ThaleahFat",
      fontWeight = 600,
      wordWrap = undefined,
      fontAlignMode = ALIGNMODES.LEFT_CENTER,
    }: {
      alignModeName?: string;
      marginX?: number;
      marginY?: number;
      parent?: UIBase;
      fontSize?: number;
      fontColor?: string;
      fontFamily?: string;
      fontWeight?: number;
      wordWrap?: number | undefined;
      fontAlignMode?: string | undefined;
    }
  ) {
    // Create basic button
    super(scene, undefined, "btn_select_skin", content, width, height, {
      alignModeName,
      marginX: marginX + 40,
      marginY,
      parent,
      fontSize,
      fontColor,
      fontFamily,
      fontWeight,
      wordWrap,
      fontAlignMode,
      leftWidthSelected: 16,
      rightWidthSelected: 16,
      topHeightSelected: 16,
      bottomHeightSelected: 16,
    });

    this.skin.setMargin(28);
    this.selectedSkin.setMargin(28);
    this.uiText.setMargin(42);

    // Underline
    new Box(scene, "btn_decor1", this.uiText.text.width / 4, 2, {
      alignModeName: ALIGNMODES.LEFT_BOTTOM,
      marginX: 42,
      parent: this,
      leftWidth: 16,
      rightWidth: 16,
      topHeight: 0,
      bottomHeight: 0,
    });

    // circle
    new UIImage(scene, "btn_decor3", 24, 24, {
      alignModeName: ALIGNMODES.LEFT_CENTER,
      parent: this,
    });

    // circle naka
    new UIImage(scene, "btn_decor2", 12, 12, {
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: -22,
      parent: this.selectedSkin,
    });

    // Arrow
    const arrow = new UIImage(scene, "btn_decor4", 32, 32, {
      alignModeName: ALIGNMODES.LEFT_CENTER,
      marginX: -58,
      parent: this.selectedSkin,
    });
    scene.tweens.add({
      targets: arrow.root,
      x: arrow.x - 6,
      duration: 600,
      repeat: -1,
      yoyo: true,
    });
  }
}

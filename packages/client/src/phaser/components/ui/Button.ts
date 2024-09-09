import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";
import { Box } from "./Box";
import { UIText } from "./UIText";
import { ALIGNMODES } from "../../../constants";

export class Button extends UIBase {
  skin: Box;
  selectedSkin: Box;
  uiText: UIText;

  selectedTexture: string;

  constructor(
    scene: UIScene,
    texture: string | undefined,
    selectedTexture: string | undefined,
    content: string,
    width: number = 128,
    height: number = 48,
    {
      alignModeName = ALIGNMODES.NONE,
      marginX = 0,
      marginY = 0,
      parent,

      fontSize = 24,
      fontColor = "#111",
      fontFamily = "Macondo",
      fontWeight = 600,
      wordWrap = undefined,
      fontAlignMode = ALIGNMODES.MIDDLE_CENTER,

      leftWidth = 32,
      rightWidth = 32,
      topHeight = 32,
      bottomHeight = 32,

      leftWidthSelected = 32,
      rightWidthSelected = 32,
      topHeightSelected = 32,
      bottomHeightSelected = 32,
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
      fontAlignMode?: string;

      leftWidth?: number;
      rightWidth?: number;
      topHeight?: number;
      bottomHeight?: number;

      leftWidthSelected?: number;
      rightWidthSelected?: number;
      topHeightSelected?: number;
      bottomHeightSelected?: number;
    }
  ) {
    super(scene, width, height, {
      texture,
      alignModeName,
      marginX,
      marginY,
      parent,
    });

    this.texture = texture ?? "ui-empty";
    this.selectedTexture = selectedTexture ?? this.texture;

    // Background (Default Skin)
    this.skin = new Box(scene, this.texture, width, height, {
      alignModeName,
      parent: this,
      leftWidth,
      rightWidth,
      topHeight,
      bottomHeight,
    });

    // Background (Selected Skin)
    this.selectedSkin = new Box(scene, this.selectedTexture, width, height, {
      alignModeName,
      parent: this,
      leftWidth: leftWidthSelected,
      rightWidth: rightWidthSelected,
      topHeight: topHeightSelected,
      bottomHeight: bottomHeightSelected,
    });
    this.selectedSkin.hide();

    // Text
    this.uiText = new UIText(scene, content, {
      alignModeName: fontAlignMode,
      parent: this,
      fontSize,
      fontColor,
      fontFamily,
      fontWeight,
      wordWrap,
    });
  }
}

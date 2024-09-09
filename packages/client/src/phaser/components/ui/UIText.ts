import { ALIGNMODES } from "../../../constants";
import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";

export class UIText extends UIBase {
  text: Phaser.GameObjects.Text;
  content: string;
  fontSize: number;
  fontWeight: number;
  fontColor: string;
  fontFamily: string;

  constructor(
    scene: UIScene,
    content: string,
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
    }
  ) {
    super(scene, 0, 0, {
      alignModeName,
      marginX,
      marginY,
      parent,
    });

    this.content = content;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.fontFamily = fontFamily;
    this.fontWeight = fontWeight;

    this.text = new Phaser.GameObjects.Text(scene, 0, 0, content, {
      fontSize: fontSize * 4 + "px",
      fontFamily: fontFamily,
      color: fontColor,
      fontStyle: fontWeight.toString(),
    });
    this.text.setScale(0.25); // Since Phaser’s problem with rendering text, solving by scaling.
    this.text.setWordWrapWidth(wordWrap);

    // Adjusting the position of the text
    const offset = this.adjustTextPositon(alignModeName);
    this.text.x += offset.x;
    this.text.y += offset.y;

    // Further adjustments for special fonts
    if (fontFamily === "ThaleahFat") {
      this.text.y -= this.text.height / 16;
    }

    this.root.add(this.text);
  }

  /**
   * Adjust the position of the text
   */
  adjustTextPositon(alignModeName: string): { x: number; y: number } {
    let offsetX = 0;
    let offsetY = 0;
    switch (alignModeName) {
      case ALIGNMODES.LEFT_CENTER:
        offsetY -= this.text.height / 8;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        offsetY -= this.text.height / 4;
        break;
      case ALIGNMODES.RIGHT_TOP:
        offsetX -= this.text.width / 4;
        break;
      case ALIGNMODES.RIGHT_CENTER:
        offsetX -= this.text.width / 4;
        offsetY -= this.text.height / 8;
        break;
      case ALIGNMODES.RIGHT_BOTTOM:
        offsetX -= this.text.width / 4;
        offsetY -= this.text.height / 4;
        break;
      case ALIGNMODES.MIDDLE_TOP:
        offsetX -= this.text.width / 8;
        break;
      case ALIGNMODES.MIDDLE_CENTER:
        offsetX -= this.text.width / 8;
        offsetY -= this.text.height / 8;
        break;
      case ALIGNMODES.MIDDLE_BOTTOM:
        offsetX -= this.text.width / 8;
        offsetY -= this.text.height / 4;
        break;
    }
    return { x: offsetX, y: offsetY };
  }

  setText(value: string | string[]) {
    const offset1 = this.adjustTextPositon(this.alignModeName);
    this.text.x -= offset1.x;
    this.text.y -= offset1.y;
    this.text.setText(value);
    const offset2 = this.adjustTextPositon(this.alignModeName);
    this.text.x += offset2.x;
    this.text.y += offset2.y;
  }

  setMargin(x?: number, y?: number) {
    super.setMargin(x, y);
    this.adjustTextPositon(this.alignModeName);
  }
}

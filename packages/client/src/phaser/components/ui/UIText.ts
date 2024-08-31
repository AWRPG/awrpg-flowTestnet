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
    alignModeName: string,
    marginX: number = 0,
    marginY: number = 0,
    {
      fontSize = 24,
      fontColor = "#111",
      fontFamily = "Macondo",
      fontWeight = 600,
    }: {
      fontSize?: number;
      fontColor?: string;
      fontFamily?: string;
      fontWeight?: number;
    },
    parent?: UIBase
  ) {
    super(scene, null, alignModeName, 0, 0, marginX, marginY, parent);
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
    this.text.setScale(0.25);
    if (this.alignModeName == ALIGNMODES.RIGHT_TOP)
      this.text.x -= this.text.width / 4;
    this.root.add(this.text);
  }

  setText(value: string | string[]) {
    if (this.alignModeName == ALIGNMODES.RIGHT_TOP)
      this.text.x += this.text.width / 4;
    this.text.setText(value);
    if (this.alignModeName == ALIGNMODES.RIGHT_TOP)
      this.text.x -= this.text.width / 4;
  }
}

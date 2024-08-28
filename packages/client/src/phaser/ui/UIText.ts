import { UIScene } from "../scenes/UIScene";
import { UIBase } from "./UIBase";

export class UIText extends UIBase {
  text: Phaser.GameObjects.Text;
  content: string;
  fontSize: number;
  fontColor: string;
  fontFamily: string;

  constructor(
    scene: UIScene,
    content: string,
    alignModeName: string,
    marginX: number = 0,
    marginY: number = 0,
    fontSize: number = 24,
    fontColor: string = "#111111",
    fontFamily: string = "Arial",
    parent?: UIBase
  ) {
    super(scene, null, alignModeName, 0, 0, marginX, marginY, parent);
    this.content = content;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.fontFamily = fontFamily;
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, content, {
      font: fontSize + "px " + fontFamily,
      color: fontColor,
    });
    this.root.add(this.text);
  }
}

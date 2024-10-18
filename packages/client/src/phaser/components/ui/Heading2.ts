import { UIText, UITextConfig } from "./common/UIText";

export class Heading2 extends UIText {
  constructor(scene: Phaser.Scene, text: string, config: UITextConfig = {}) {
    super(scene, text, {
      ...config,
      fontFamily: config.fontFamily ?? "Macondo",
      fontSize: config.fontSize ?? 36,
      fontStyle: config.fontStyle ?? "600",
      fontColor: config.fontColor ?? "#111",
    });
  }
}

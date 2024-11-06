import { ALIGNMODES } from "../../../../constants";
import { UIBase, UIBaseConfig } from "./UIBase";
import { UIText } from "./UIText";
import { StandardGameSize } from "./UIBase";

export interface UITextConfig extends UIBaseConfig {
  fontFamily?: string;
  fontSize?: number;
  fontSizeUnit?: string;
  fontSizeResponsive?: boolean;
  fontStyle?: string;
  textAlign?: string;
  fontColor?: string | CanvasGradient | CanvasPattern;
  backgroundColor?: string;
  strokeColor?: string | CanvasGradient | CanvasPattern;
  strokeThickness?: number;
  shadow?: Phaser.Types.GameObjects.Text.TextShadow;
  padding?: Phaser.Types.GameObjects.Text.TextPadding;
  maxLines?: number;
  fixedWidth?: number;
  fixedHeight?: number;
  rtl?: boolean;
  wordWrap?: Phaser.Types.GameObjects.Text.TextWordWrap;
  wordWrapWidth?: number;
  metrics?: Phaser.Types.GameObjects.Text.TextMetrics;
  lineSpacing?: number;
}

export class UIInput extends UIText {
  constructor(scene: Phaser.Scene, config: UITextConfig = {}) {
    super(scene, "", config);
  }
}

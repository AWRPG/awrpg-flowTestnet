import { ALIGNMODES } from "../../../../constants";
import { UIBase, UIBaseConfig } from "./UIBase";

export interface UITextConfig extends UIBaseConfig {
  fontFamily?: string;
  fontSize?: number;
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

export class UIText extends UIBase {
  textObj: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, text: string, config: UITextConfig = {}) {
    super(scene, { width: -1, height: -1, ...config });

    this.textObj = new Phaser.GameObjects.Text(scene, 0, 0, text, {
      ...config,
      fontSize: (config.fontSize ?? 24) * 4,
      color: config.fontColor ?? "#000",
      stroke: config.strokeColor,
      align: config.textAlign,
    });

    // if (config.fontFamily) this.textObj.setFontFamily(config.fontFamily);
    this.textObj.setScale(0.25); // Since Phaser’s problem with rendering text, solving by scaling.
    if (!config.wordWrap) this.textObj.setWordWrapWidth(config.wordWrapWidth);

    // Adjusting the position of the text
    const offset = this.adjustTextPositon();
    this.textObj.x += offset.x;
    this.textObj.y += offset.y;

    // Further adjustments for special fonts
    if (config.fontFamily === "ThaleahFat") {
      this.textObj.y -= this.textObj.height / 16;
    }

    this.root.add(this.textObj);
  }

  /**
   * Adjust the position of the text
   */
  adjustTextPositon(): { x: number; y: number } {
    let offsetX = 0;
    let offsetY = 0;
    switch (this.alignModeName) {
      case ALIGNMODES.LEFT_CENTER:
        offsetY -= this.textObj.height / 8;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        offsetY -= this.textObj.height / 4;
        break;
      case ALIGNMODES.RIGHT_TOP:
        offsetX -= this.textObj.width / 4;
        break;
      case ALIGNMODES.RIGHT_CENTER:
        offsetX -= this.textObj.width / 4;
        offsetY -= this.textObj.height / 8;
        break;
      case ALIGNMODES.RIGHT_BOTTOM:
        offsetX -= this.textObj.width / 4;
        offsetY -= this.textObj.height / 4;
        break;
      case ALIGNMODES.MIDDLE_TOP:
        offsetX -= this.textObj.width / 8;
        break;
      case ALIGNMODES.MIDDLE_CENTER:
        offsetX -= this.textObj.width / 8;
        offsetY -= this.textObj.height / 8;
        break;
      case ALIGNMODES.MIDDLE_BOTTOM:
        offsetX -= this.textObj.width / 8;
        offsetY -= this.textObj.height / 4;
        break;
    }
    return { x: offsetX, y: offsetY };
  }

  /**
   * Set the text to display.
   *
   * An array of strings will be joined with `\n` line breaks.
   * @param value The string, or array of strings, to be set as the content of this Text object.
   */
  setText(value: string | string[]): UIText {
    const offset1 = this.adjustTextPositon();
    this.textObj.x -= offset1.x;
    this.textObj.y -= offset1.y;
    this.textObj.setText(value);
    const offset2 = this.adjustTextPositon();
    this.textObj.x += offset2.x;
    this.textObj.y += offset2.y;
    return this;
  }

  /**
   * Appends the given text to the content already being displayed by this Text object.
   * An array of strings will be joined with `\n` line breaks.
   * @param value The string, or array of strings, to be appended to the existing content of this Text object.
   * @param addCR Insert a carriage-return before the string value. Default true.
   */
  appendText(value: string | string[], addCR?: boolean): UIText {
    const offset1 = this.adjustTextPositon();
    this.textObj.x -= offset1.x;
    this.textObj.y -= offset1.y;
    this.textObj.appendText(value, addCR);
    const offset2 = this.adjustTextPositon();
    this.textObj.x += offset2.x;
    this.textObj.y += offset2.y;
    return this;
  }

  /**
   * Set the text style.
   * @param style The style settings to set.
   */
  setStyle(style: object): UIText {
    this.textObj.setStyle(style);
    return this;
  }

  /**
   * Set the font.
   * @param font The font family or font settings to set.
   */
  setFont(font: string): UIText {
    this.textObj.setFont(font);
    return this;
  }

  /**
   * Set a fixed width and height for the text.
   * Pass in `0` for either of these parameters to disable fixed width or height respectively.
   * @param width The fixed width to set. `0` disables fixed width.
   * @param height The fixed height to set. `0` disables fixed height.
   */
  setFixedSize(width: number, height: number): UIText {
    this.textObj.setFixedSize(width, height);
    return this;
  }

  /**
   * Set the stroke color.
   * @param color The stroke color.
   * @param thickness The stroke thickness.
   */
  setStroke(
    color: string | CanvasGradient | CanvasPattern,
    thickness: number
  ): UIText {
    this.textObj.setStroke(color, thickness);
    return this;
  }

  /**
   * Set the shadow settings.
   * @param x The horizontal shadow offset. Default 0.
   * @param y The vertical shadow offset. Default 0.
   * @param color The shadow color. Default '#000'.
   * @param blur The shadow blur radius. Default 0.
   * @param shadowStroke Whether to stroke the shadow. Default false.
   * @param shadowFill Whether to fill the shadow. Default true.
   */
  setShadow(
    x?: number,
    y?: number,
    color?: string,
    blur?: number,
    shadowStroke?: boolean,
    shadowFill?: boolean
  ): UIText {
    this.textObj.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    return this;
  }

  /**
   * Set the shadow offset.
   * @param x The horizontal shadow offset.
   * @param y The vertical shadow offset.
   */
  setShadowOffset(x: number, y: number): UIText {
    this.textObj.setShadowOffset(x, y);
    return this;
  }

  /**
   * Set the width (in pixels) to use for wrapping lines. Pass in null to remove wrapping by width.
   * @param width The maximum width of a line in pixels. Set to null to remove wrapping.
   * @param useAdvancedWrap Whether or not to use the advanced wrapping
   * algorithm. If true, spaces are collapsed and whitespace is trimmed from lines. If false,
   * spaces and whitespace are left as is. Default false.
   */
  setWordWrapWidth(
    width: number | undefined,
    useAdvancedWrap?: boolean
  ): UIText {
    this.textObj.setWordWrapWidth(width, useAdvancedWrap);
    return this;
  }

  /**
   * Set a custom callback for wrapping lines. Pass in null to remove wrapping by callback.
   * @param callback A custom function that will be responsible for wrapping the
   * text. It will receive two arguments: text (the string to wrap), textObject (this Text
   * instance). It should return the wrapped lines either as an array of lines or as a string with
   * newline characters in place to indicate where breaks should happen.
   * @param scope The scope that will be applied when the callback is invoked. Default null.
   */
  setWordWrapCallback(
    callback: TextStyleWordWrapCallback,
    scope?: object
  ): UIText {
    this.textObj.setWordWrapCallback(callback, scope);
    return this;
  }

  /**
   * Set the text padding.
   * 'left' can be an object.
   * If only 'left' and 'top' are given they are treated as 'x' and 'y'.
   * @param left The left padding value, or a padding config object.
   * @param top The top padding value.
   * @param right The right padding value.
   * @param bottom The bottom padding value.
   */
  setPadding(
    left: number | Phaser.Types.GameObjects.Text.TextPadding,
    top?: number,
    right?: number,
    bottom?: number
  ): UIText {
    this.textObj.setPadding(left, top, right, bottom);
    return this;
  }

  //===========================================
  //    Simplified writing for ease of use
  //===========================================
  get text() {
    return this.textObj.text;
  }

  set text(value: string | string[]) {
    this.textObj.setText(value);
  }

  get fontFamily() {
    return this.textObj.style.fontFamily;
  }

  set fontFamily(value: string) {
    this.textObj.setFontFamily(value);
  }

  get fontSize() {
    return this.textObj.style.fontSize;
  }

  set fontSize(value: string | number) {
    this.textObj.setFontSize(
      typeof value === "string" ? parseInt(value, 10) * 4 : value * 4
    );
  }

  get fontStyle() {
    return this.textObj.style.fontStyle;
  }

  set fontStyle(value: string) {
    this.textObj.setFontStyle(value);
  }

  get textAlign() {
    return this.textObj.style.align;
  }

  set textAlign(value: string) {
    this.textObj.setAlign(value);
  }

  get fontColor() {
    return this.textObj.style.color;
  }

  set fontColor(value: string | CanvasGradient | CanvasPattern) {
    this.textObj.setColor(value);
  }

  get backgroundColor() {
    return this.textObj.style.backgroundColor;
  }

  set backgroundColor(value: string) {
    this.textObj.setBackgroundColor(value);
  }

  get strokeColor() {
    return this.textObj.style.stroke;
  }

  set strokeColor(value: string | CanvasGradient | CanvasPattern) {
    this.setStroke(value, this.textObj.style.strokeThickness ?? 0);
  }

  get strokeThickness() {
    return this.textObj.style.strokeThickness;
  }

  set strokeThickness(value: number) {
    this.setStroke(this.textObj.style.stroke, value);
  }

  get shadowOffsetX() {
    return this.textObj.style.shadowOffsetX;
  }

  set shadowOffsetX(value: number) {
    this.setShadowOffset(value, this.textObj.style.shadowOffsetY);
  }

  get shadowOffsetY() {
    return this.textObj.style.shadowOffsetY;
  }

  set shadowOffsetY(value: number) {
    this.setShadow(this.textObj.style.shadowOffsetX, value);
  }

  get shadowColor() {
    return this.textObj.style.shadowColor;
  }

  set shadowColor(value: string) {
    this.textObj.setShadowColor(value);
  }

  get shadowBlur() {
    return this.textObj.style.shadowBlur;
  }

  set shadowBlur(value: number) {
    this.textObj.setShadowBlur(value);
  }

  get shadowStroke() {
    return this.textObj.style.shadowStroke;
  }

  set shadowStroke(value: boolean) {
    this.textObj.setShadowStroke(value);
  }

  get shadowFill() {
    return this.textObj.style.shadowFill;
  }

  set shadowFill(value: boolean) {
    this.textObj.setShadowFill(value);
  }

  get wordWrapWidth() {
    return this.textObj.style.wordWrapWidth;
  }

  set wordWrapWidth(value: number | null) {
    this.setWordWrapWidth(value as any);
  }

  get lineSpacing() {
    return this.textObj.lineSpacing;
  }

  set lineSpacing(value: number) {
    this.textObj.setLineSpacing(value);
  }

  get letterSpacing() {
    return this.textObj.letterSpacing;
  }

  set letterSpacing(value: number) {
    this.textObj.setLetterSpacing(value);
  }

  get padding() {
    return this.textObj.padding;
  }

  set padding(value: Phaser.Types.GameObjects.Text.TextPadding) {
    this.setPadding(value);
  }

  get maxLines() {
    return this.textObj.style.maxLines;
  }

  set maxLines(value: number) {
    this.textObj.setMaxLines(value);
  }

  get fixedWidth() {
    return this.textObj.style.fixedWidth;
  }

  set fixedWidth(value: number) {
    this.setFixedSize(value, this.textObj.style.fixedHeight);
  }

  get fixedHeight() {
    return this.textObj.style.fixedHeight;
  }

  set fixedHeight(value: number) {
    this.setFixedSize(this.textObj.style.fixedWidth, value);
  }

  get rtl() {
    return this.textObj.style.rtl;
  }

  set rtl(value: boolean) {
    this.textObj.setRTL(value);
  }

  get blendMode() {
    return this.textObj.blendMode;
  }

  set blendMode(value: Phaser.BlendModes | string | number) {
    this.textObj.setBlendMode(value);
  }
}

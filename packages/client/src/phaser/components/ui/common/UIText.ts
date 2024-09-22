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
    super(scene, { width: 0, height: 0, ...config });

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
    const offset = this.adjustTextPositon(this.alignModeName);
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
  adjustTextPositon(alignModeName: string): { x: number; y: number } {
    let offsetX = 0;
    let offsetY = 0;
    switch (alignModeName) {
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
  setText(value: string | string[]): Phaser.GameObjects.Text {
    const offset1 = this.adjustTextPositon(this.alignModeName);
    this.textObj.x -= offset1.x;
    this.textObj.y -= offset1.y;
    this.textObj.setText(value);
    const offset2 = this.adjustTextPositon(this.alignModeName);
    this.textObj.x += offset2.x;
    this.textObj.y += offset2.y;
    return this.textObj;
  }

  /**
   * Appends the given text to the content already being displayed by this Text object.
   * An array of strings will be joined with `\n` line breaks.
   * @param value The string, or array of strings, to be appended to the existing content of this Text object.
   * @param addCR Insert a carriage-return before the string value. Default true.
   */
  appendText(
    value: string | string[],
    addCR?: boolean
  ): Phaser.GameObjects.Text {
    return this.textObj.appendText(value);
  }

  /**
   * Set the text style.
   * @param style The style settings to set.
   */
  setStyle(style: object): Phaser.GameObjects.Text {
    return this.textObj.setStyle(style);
  }

  /**
   * Set the font.
   * @param font The font family or font settings to set.
   */
  setFont(font: string): Phaser.GameObjects.Text {
    return this.textObj.setFont(font);
  }

  /**
   * Set the font family.
   *
   * **Important:** The font name must be quoted if it contains certain combinations of digits or special characters:
   * ```javascript
   * setFontFamily('"Press Start 2P"');
   * setFontFamily('Georgia, "Goudy Bookletter 1911", Times, serif');
   * ```
   * @param family The font family.
   */
  setFontFamily(family: string): Phaser.GameObjects.Text {
    return this.textObj.setFontFamily(family);
  }

  /**
   * Set the font size. Can be a string with a valid CSS unit, i.e. `16px`, or a number.
   * @param size The font size.
   */
  setFontSize(size: number): Phaser.GameObjects.Text {
    return this.textObj.setFontSize(size * 4);
  }

  /**
   * Set the font style, such as 'bold', 'italic' or 'bold italic'
   * @param style The font style.
   */
  setFontStyle(style: string): Phaser.GameObjects.Text {
    return this.textObj.setFontStyle(style);
  }

  /**
   * Set a fixed width and height for the text.
   * Pass in `0` for either of these parameters to disable fixed width or height respectively.
   * @param width The fixed width to set. `0` disables fixed width.
   * @param height The fixed height to set. `0` disables fixed height.
   */
  setFixedSize(width: number, height: number): Phaser.GameObjects.Text {
    return this.textObj.setFixedSize(width, height);
  }

  /**
   * Set the alignment of the text in this Text object.
   *
   * The argument can be one of: `left`, `right`, `center` or `justify`.
   * Alignment only works if the Text object has more than one line of text.
   * @param align The text alignment for multi-line text. Default 'left'.
   */
  setTextAlign(align?: string): Phaser.GameObjects.Text {
    return this.textObj.setAlign(align);
  }

  /**
   * Set the text fill color.
   * @param color The text fill color.
   */
  setFontColor(
    color: string | CanvasGradient | CanvasPattern
  ): Phaser.GameObjects.Text {
    return this.textObj.setColor(color);
  }

  /**
   * Set the background color.
   * @param color The background color.
   */
  setBackgroundColor(color: string): Phaser.GameObjects.Text {
    return this.textObj.setBackgroundColor(color);
  }

  /**
   * Set the stroke color.
   * @param color The stroke color.
   */
  setStroke(
    color: string | CanvasGradient | CanvasPattern,
    thickness: number
  ): Phaser.GameObjects.Text {
    return this.textObj.setStroke(color, thickness);
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
  ): Phaser.GameObjects.Text {
    return this.textObj.setShadow(x, y, color, blur, shadowStroke, shadowFill);
  }

  /**
   * Set the shadow offset.
   * @param x The horizontal shadow offset.
   * @param y The vertical shadow offset.
   */
  setShadowOffset(x: number, y: number): Phaser.GameObjects.Text {
    return this.textObj.setShadowOffset(x, y);
  }

  /**
   * Set the shadow color.
   * @param color The shadow color.
   */
  setShadowColor(color: string): Phaser.GameObjects.Text {
    return this.textObj.setShadowColor(color);
  }

  /**
   * Set the shadow blur radius.
   * @param blur The shadow blur radius.
   */
  setShadowBlur(blur: number): Phaser.GameObjects.Text {
    return this.textObj.setShadowBlur(blur);
  }

  /**
   * Enable or disable shadow stroke.
   * @param enabled Whether shadow stroke is enabled or not.
   */
  setShadowStroke(enabled: boolean): Phaser.GameObjects.Text {
    return this.textObj.setShadowStroke(enabled);
  }

  /**
   * Enable or disable shadow fill.
   * @param enabled Whether shadow fill is enabled or not.
   */
  setShadowFill(enabled: boolean): Phaser.GameObjects.Text {
    return this.textObj.setShadowFill(enabled);
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
  ): Phaser.GameObjects.Text {
    return this.textObj.setWordWrapWidth(width, useAdvancedWrap);
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
  ): Phaser.GameObjects.Text {
    return this.textObj.setWordWrapCallback(callback, scope);
  }

  /**
   * Sets the line spacing value.
   * This value is _added_ to the height of the font when calculating the overall line height.
   * This only has an effect if this Text object consists of multiple lines of text.
   * @param value The amount to add to the font height to achieve the overall line height.
   */
  setLineSpacing(value: number): Phaser.GameObjects.Text {
    return this.textObj.setLineSpacing(value);
  }

  /**
   * Sets the letter spacing value.
   *
   * This will add, or remove spacing between each character of this Text Game Object. The value can be
   * either positive or negative. Positive values increase the space between each character, whilst negative
   * values decrease it. Note that some fonts are spaced naturally closer together than others.
   *
   * Please understand that enabling this feature will cause Phaser to render each character in this Text object
   * one by one, rather than use a draw for the whole string. This makes it extremely expensive when used with
   * either long strings, or lots of strings in total. You will be better off creating bitmap font text if you
   * need to display large quantities of characters with fine control over the letter spacing.
   * @param value The amount to add to the letter width. Set to zero to disable.
   */
  setLetterSpacing(value: number): Phaser.GameObjects.Text {
    return this.textObj.setLineSpacing(value);
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
  ): Phaser.GameObjects.Text {
    return this.textObj.setPadding(left, top, right, bottom);
  }

  /**
   * Set the maximum number of lines to draw.
   * @param max The maximum number of lines to draw. Default 0.
   */
  setMaxLines(max?: number): Phaser.GameObjects.Text {
    return this.textObj.setMaxLines(max);
  }

  /**
   * Render text from right-to-left or left-to-right.
   * @param rtl Set to `true` to render from right-to-left. Default true.
   */
  setRTL(rtl?: boolean): Phaser.GameObjects.Text {
    return this.textObj.setRTL(rtl);
  }

  /**
   * Sets the Blend Mode being used by this Game Object.
   *
   * This can be a const, such as `Phaser.BlendModes.SCREEN`, or an integer, such as 4 (for Overlay)
   *
   * Under WebGL only the following Blend Modes are available:
   *
   * * NORMAL
   * * ADD
   * * MULTIPLY
   * * SCREEN
   * * ERASE (only works when rendering to a framebuffer, like a Render Texture)
   *
   * Canvas has more available depending on browser support.
   *
   * You can also create your own custom Blend Modes in WebGL.
   *
   * Blend modes have different effects under Canvas and WebGL, and from browser to browser, depending
   * on support. Blend Modes also cause a WebGL batch flush should it encounter a new blend mode. For these
   * reasons try to be careful about the construction of your Scene and the frequency in which blend modes
   * are used.
   * @param value The BlendMode value. Either a string, a CONST or a number.
   */
  setBlendMode(
    value: string | Phaser.BlendModes | number
  ): Phaser.GameObjects.Text {
    return this.textObj.setBlendMode(value);
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
    this.setFontFamily(value);
  }

  get fontSize() {
    return this.textObj.style.fontSize;
  }

  set fontSize(value: string | number) {
    this.setFontSize(
      typeof value === "string" ? parseInt(value, 10) * 4 : value * 4
    );
  }

  get fontStyle() {
    return this.textObj.style.fontStyle;
  }

  set fontStyle(value: string) {
    this.setFontStyle(value);
  }

  get textAlign() {
    return this.textObj.style.align;
  }

  set textAlign(value: string) {
    this.setTextAlign(value);
  }

  get fontColor() {
    return this.textObj.style.color;
  }

  set fontColor(value: string | CanvasGradient | CanvasPattern) {
    this.setFontColor(value);
  }

  get backgroundColor() {
    return this.textObj.style.backgroundColor;
  }

  set backgroundColor(value: string) {
    this.setBackgroundColor(value);
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
    this.setShadowColor(value);
  }

  get shadowBlur() {
    return this.textObj.style.shadowBlur;
  }

  set shadowBlur(value: number) {
    this.setShadowBlur(value);
  }

  get shadowStroke() {
    return this.textObj.style.shadowStroke;
  }

  set shadowStroke(value: boolean) {
    this.setShadowStroke(value);
  }

  get shadowFill() {
    return this.textObj.style.shadowFill;
  }

  set shadowFill(value: boolean) {
    this.setShadowFill(value);
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
    this.setLineSpacing(value);
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
    this.setMaxLines(value);
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
    this.setRTL(value);
  }

  get blendMode() {
    return this.textObj.blendMode;
  }

  set blendMode(value: Phaser.BlendModes | string | number) {
    this.setBlendMode(value);
  }
}

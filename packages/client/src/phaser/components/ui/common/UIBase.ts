import { ALIGNMODES } from "../../../../constants";

export interface UIBaseConfig {
  texture?: string | undefined;
  alignModeName?: string;
  width?: number;
  height?: number;
  marginX?: number;
  marginY?: number;
  scale?: number;
  parent?: UIBase | undefined;
}

/**
 * The most basic UI components
 * There is only one root node inherited, which can be used as a container.
 */
export class UIBase {
  /** A empty gameObject as the root node*/
  root: Phaser.GameObjects.Container;

  /** the scene */
  scene: Phaser.Scene;

  /** The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.*/
  texture: string | undefined;

  /** The alignments provided in “ALIGNMODES” include LEFT-MIDDLE-RIGHT, TOP-CENTER-BOTTOM. @readonly */
  alignModeName: string;

  /** parent UI of this UI  */
  parent: UIBase | undefined;

  /** The horizontal distance (px) to the align position @readonly */
  marginX: number;

  /** The vertical distance (px) to the align position @readonly */
  marginY: number;

  /** */
  constructor(scene: Phaser.Scene, config: UIBaseConfig) {
    this.scene = scene;
    this.texture = config.texture;
    this.alignModeName = config.alignModeName ?? ALIGNMODES.LEFT_TOP;
    this.marginX = config.marginX ?? 0;
    this.marginY = config.marginY ?? 0;
    this.parent = config.parent;

    // Creates the root container & init size and position
    this.root = new Phaser.GameObjects.Container(scene, 0, 0);
    this.setAutoScale(config);
    this.updatePosition();

    // Mounts the root on the specified object
    if (this.parent) {
      this.parent.root.add(this.root);
    } else {
      scene.add.existing(this.root);
    }
  }

  /**
   * Mount several basic UI components on the root container
   */
  add(children: UIBase | UIBase[]) {
    if (Array.isArray(children)) {
      for (const i in children) this.root.add(children[i].root);
    } else {
      this.root.add(children.root);
    }
  }

  /**
   * Sets the visibility of the root container.
   * An invisible UI component will skip rendering, but will still process update logic.
   * @param value The visible state of the Game Object.
   */
  setVisible(value: boolean): Phaser.GameObjects.Container {
    return this.root.setVisible(value);
  }

  /**
   * Show the root container
   */
  show() {
    this.setVisible(true);
  }

  /**
   * Hide the root container
   */
  hide() {
    this.setVisible(false);
  }

  /**
   * Set the scale, size & display size of the root container
   */
  setAutoScale(config: Partial<UIBaseConfig>) {
    const textureObj = config.texture
      ? this.scene.textures.get(config.texture)
      : undefined;
    const width =
      config.width !== undefined
        ? config.width
        : textureObj?.source[0]?.width ?? 576;
    const height =
      config.height !== undefined
        ? config.height
        : textureObj?.source[0]?.height ?? 324;

    if (width !== 0 || height !== 0) {
      this.root.setSize(width, height);
      this.root.setDisplaySize(width, height);
    }
    if (config.scale !== undefined) this.root.setScale(config.scale);
  }

  /**
   * Set coordinates according to alignment
   */
  updatePosition() {
    const referObj = this.parent ?? this.scene.scale;
    switch (this.alignModeName) {
      case ALIGNMODES.LEFT_CENTER:
        this.x = this.marginX;
        this.y = referObj.height / 2 + this.marginY - this.displayHeight / 2;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        this.x = this.marginX;
        this.y = referObj.height - this.marginY - this.displayHeight;
        break;
      case ALIGNMODES.RIGHT_TOP:
        this.x = referObj.width - this.marginX - this.displayWidth;
        this.y = this.marginY;
        break;
      case ALIGNMODES.RIGHT_CENTER:
        this.x = referObj.width - this.marginX - this.displayWidth;
        this.y = referObj.height / 2 + this.marginY - this.displayHeight / 2;
        break;
      case ALIGNMODES.RIGHT_BOTTOM:
        this.x = referObj.width - this.marginX - this.displayWidth;
        this.y = referObj.height - this.marginY - this.displayHeight;
        break;
      case ALIGNMODES.MIDDLE_TOP:
        this.x = referObj.width / 2 + this.marginX - this.displayWidth / 2;
        this.y = this.marginY;
        break;
      case ALIGNMODES.MIDDLE_CENTER:
        this.x = referObj.width / 2 + this.marginX - this.displayWidth / 2;
        this.y = referObj.height / 2 + this.marginY - this.displayHeight / 2;
        break;
      case ALIGNMODES.MIDDLE_BOTTOM:
        this.x = referObj.width / 2 + this.marginX - this.displayWidth / 2;
        this.y = referObj.height - this.marginY - this.displayHeight;
        break;
      default:
        this.x = this.marginX;
        this.y = this.marginY;
        break;
    }
  }

  /**
   * Change the position. Considered unchanged by default.
   * Considering alignment and such, it's not recommended to use it directly
   * unless you're pretty sure there's no problem with the location.
   * @param x new x
   * @param y new y
   */
  setPosition(x?: number, y?: number) {
    if (x) this.root.x = this.x = x;
    if (y) this.root.y = this.y = y;
  }

  /**
   * Change the margin and synchronize position changes. Considered unchanged by default.
   * @param x new marginX
   * @param y new marginY
   */
  setMargin(x?: number, y?: number) {
    if (x) this.marginX = x;
    if (y) this.marginY = y;
    this.updatePosition();
    this.root.x = this.x;
    this.root.y = this.y;
  }

  /**
   * Modify alignment mode and synchronize position changes
   * @param name the name of alignMode you want to use
   */
  setAlignMode(name: string) {
    this.alignModeName = name;
    this.updatePosition();
    this.root.x = this.x;
    this.root.y = this.y;
  }

  /**
   * Sets the display size of this Game Object. Calling this will adjust the scale.
   * @param width The width of this Game Object.
   * @param height The height of this Game Object.
   */
  setDisplaySize(width: number, height: number): Phaser.GameObjects.Container {
    return this.root.setDisplaySize(width, height);
  }

  /**
   * Sets the scale of this Game Object.
   * @param x The horizontal scale of this Game Object. Default 1.
   * @param y The vertical scale of this Game Object. If not set it will use the `x` value. Default x.
   */
  setScale(x?: number, y?: number): Phaser.GameObjects.Container {
    return this.root.setScale(x, y);
  }

  /**
   * Sets the internal size of this Game Object, as used for frame or physics body creation.
   * This will not change the size that the Game Object is rendered in-game. For that you need to call `setScale` or `setDisplaySize` method.
   * @param width The width of this Game Object.
   * @param height The height of this Game Object.
   */
  setSize(width: number, height: number): Phaser.GameObjects.Container {
    return this.root.setSize(width, height);
  }

  /**
   * Clears all alpha values associated with this Game Object.
   * Immediately sets the alpha levels back to 1 (fully opaque).
   */
  clearAlpha(): Phaser.GameObjects.Container {
    return this.root.clearAlpha();
  }

  /**
   * Set the Alpha level of this Game Object. The alpha controls the opacity of the Game Object as it renders.
   * Alpha values are provided as a float between 0, fully transparent, and 1, fully opaque.
   * @param value The alpha value applied across the whole Game Object. Default 1.
   */
  setAlpha(value?: number): Phaser.GameObjects.Container {
    return this.root.setAlpha(value);
  }

  /**
   * Remove and Destroy all Game Objects in the Container.
   */
  destroyChildren() {
    this.root.removeAll(true);
  }

  //===========================================
  //    Simplified writing for ease of use
  //===========================================
  get x() {
    return this.root.x;
  }

  set x(value: number) {
    this.root.x = value;
  }

  get y() {
    return this.root.y;
  }

  set y(value: number) {
    this.root.y = value;
  }

  get width() {
    return this.root.width;
  }

  set width(value: number) {
    this.setSize(value, this.root.height);
  }

  get height() {
    return this.root.height;
  }

  set height(value: number) {
    this.setSize(this.root.width, value);
  }

  get displayWidth() {
    return this.root.displayWidth;
  }

  set displayWidth(value: number) {
    this.setDisplaySize(value, this.displayHeight);
  }

  get displayHeight() {
    return this.root.displayHeight;
  }

  set displayHeight(value: number) {
    this.setDisplaySize(this.displayWidth, value);
  }

  get scale() {
    return this.root.scale;
  }

  set scale(value: number) {
    this.setScale(value);
  }

  get alpha() {
    return this.root.alpha;
  }

  set alpha(value: number) {
    this.setAlpha(value);
  }

  get visible() {
    return this.root.visible;
  }

  set visible(value: boolean) {
    this.setVisible(value);
  }
}

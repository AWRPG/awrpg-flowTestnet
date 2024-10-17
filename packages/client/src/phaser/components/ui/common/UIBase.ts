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
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * The most basic UI components
 * There is only one root node inherited, which can be used as a container.
 */
export class UIBase {
  /** A empty gameObject as the root node*/
  root: Phaser.GameObjects.Container;

  /** The key, or instance of the Texture this Game Object will use to render with, as stored in the Texture Manager.*/
  texture: string | undefined;

  /** The alignments provided in “ALIGNMODES” include LEFT-MIDDLE-RIGHT, TOP-CENTER-BOTTOM. @readonly */
  alignModeName: string;

  /** parent UI of this UI  */
  protected _parent: UIBase | undefined;

  /** children UIs of this UI  */
  children: UIBase[] = [];

  /** The horizontal distance (px) to the align position @readonly */
  marginX: number;

  /** The vertical distance (px) to the align position @readonly */
  marginY: number;

  /** The global x position of root @readonly */
  globalX: number = 0;

  /** The global y position of root @readonly */
  globalY: number = 0;

  /** Mouse over */
  hovering: boolean = false;

  /**  */
  onConfirm?: () => void;

  onCancel?: () => void;

  /** */
  constructor(scene: Phaser.Scene, config: UIBaseConfig = {}) {
    this.texture = config.texture;
    this.alignModeName = config.alignModeName ?? ALIGNMODES.LEFT_TOP;
    this.marginX = config.marginX ?? 0;
    this.marginY = config.marginY ?? 0;

    // Creates the root container & init size and position
    this.root = new Phaser.GameObjects.Container(scene, 0, 0);
    this.parent = config.parent;
    this.onConfirm = config.onConfirm;
    this.onCancel = config.onCancel;
    this.setAutoScale(config);
    this.updatePosition();

    // Mounts the root on the specified object
    this.init();
  }

  /**
   * Initialise the rest
   */
  init() {
    // Expand as needed
  }

  /**
   * Mount several basic UI components on the root container
   */
  add(children: UIBase | UIBase[]): UIBase {
    if (Array.isArray(children)) {
      for (const i in children) this.root.add(children[i].root);
    } else {
      this.root.add(children.root);
    }
    return this;
  }

  /**
   * Show the root container
   */
  show(): UIBase {
    this.visible = true;
    return this;
  }

  /**
   * Hide the root container
   */
  hidden(): UIBase {
    this.visible = false;
    return this;
  }

  /**
   * Set the scale, size & display size of the root container
   */
  setAutoScale(config: Partial<UIBaseConfig>): UIBase {
    if (config.width !== -1 && config.height !== -1) {
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
      this.root.setSize(width, height);
      this.root.setDisplaySize(width, height);
    }
    if (config.scale !== undefined) this.root.setScale(config.scale);
    return this;
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
    this.updateGlobalPosition();
  }

  /**
   * Update self and all children's global x & y
   */
  updateGlobalPosition(): UIBase {
    this.globalX = this.parent ? this.parent.globalX + this.x : this.x;
    this.globalY = this.parent ? this.parent.globalY + this.y : this.y;
    for (let child in this.children) {
      this.children[child].updateGlobalPosition();
    }
    return this;
  }

  /**
   * Add a listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   */
  on(event: string | symbol, fn: Function, context?: any): UIBase {
    this.root.on(event, fn, context);
    return this;
  }

  /**
   * Add a one-time listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   */
  once(event: string | symbol, fn: Function, context?: any): UIBase {
    this.root.once(event, fn, context);
    return this;
  }

  /**
   * Remove the listeners of a given event or all listeners
   * @param event The event name.
   * @param fn Only remove the listeners that match this function.
   * @param context Only remove the listeners that have this context.
   * @param once Only remove one-time listeners.
   */
  off(
    event?: string | symbol,
    fn?: Function,
    context?: any,
    once?: boolean
  ): UIBase {
    if (event) {
      this.root.off(event, fn, context, once);
    } else {
      this.root.removeAllListeners();
    }
    return this;
  }

  /**
   * Return the listeners registered for a given event.
   * @param event The event name.
   */
  listeners(event: string | symbol): Function[] {
    return this.root.listeners(event);
  }

  /**
   * Return the number of listeners listening to a given event.
   * @param event The event name.
   */
  listenerCount(event: string | symbol): number {
    return this.root.listenerCount(event);
  }

  /**
   * Calls each of the listeners registered for a given event.
   * @param event The event name.
   * @param args Additional arguments that will be passed to the event handler.
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    return this.root.emit(event, ...args);
  }

  /**
   * Change the position. Considered unchanged by default.
   * Considering alignment and such, it's not recommended to use it directly
   * unless you're pretty sure there's no problem with the location.
   * @param x new x
   * @param y new y
   */
  setPosition(x: number | undefined, y?: number): UIBase {
    if (x != undefined) this.x = x;
    if (y != undefined) this.y = y;
    this.updateGlobalPosition();
    return this;
  }

  /**
   * Change the margin and synchronize position changes. Considered unchanged by default.
   * @param x new marginX
   * @param y new marginY
   */
  setMargin(x?: number, y?: number): UIBase {
    if (x) this.marginX = x;
    if (y) this.marginY = y;
    this.updatePosition();
    return this;
  }

  /**
   * Modify alignment mode and synchronize position changes
   * @param name the name of alignMode you want to use
   */
  setAlignMode(name: string): UIBase {
    this.alignModeName = name;
    this.updatePosition();
    return this;
  }

  /**
   * Sets the internal size of this Game Object, as used for frame or physics body creation.
   * This will not change the size that the Game Object is rendered in-game. For that you need to call `setScale` or `setDisplaySize` method.
   * @param width The width of this Game Object.
   * @param height The height of this Game Object.
   */
  setSize(width: number, height: number): UIBase {
    this.root.setSize(width, height);
    return this;
  }

  /**
   * Sets the display size of this Game Object. Calling this will adjust the scale.
   * @param width The width of this Game Object.
   * @param height The height of this Game Object.
   */
  setDisplaySize(width: number, height: number): UIBase {
    this.root.setDisplaySize(width, height);
    return this;
  }

  /**
   * Sets the scale of this Game Object.
   * @param x The horizontal scale of this Game Object. Default 1.
   * @param y The vertical scale of this Game Object. If not set it will use the `x` value. Default x.
   */
  setScale(x?: number, y?: number): UIBase {
    this.root.setScale(x, y);
    return this;
  }

  /**
   * Remove and Destroy all Game Objects in the Container.
   */
  destroyChildren() {
    this.root.removeAll(true);
  }

  get parent() {
    return this._parent;
  }

  set parent(value: UIBase | undefined) {
    if (this.parent) {
      this.parent.root.remove(this.root);
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
    } else {
      this.scene.children.remove(this.root);
    }
    this._parent = value;
    if (value) {
      value.root.add(this.root);
      value.children.push(this);
    } else {
      this.scene.add.existing(this.root);
    }
  }

  //===========================================
  //    About the listeners
  //===========================================
  onFocus() {}
  onBlur() {}
  onUpPressed() {}
  onDownPressed() {}
  onLeftPressed() {}
  onRightPressed() {}

  onConfirmPressed() {
    if (this.onConfirm) this.onConfirm();
  }

  onCancelPressed() {
    if (this.onCancel) this.onCancel();
  }

  onSelected() {}
  onUnSelected() {}
  onHover() {
    this.hovering = true;
  }
  onUnHover() {
    this.hovering = false;
  }

  //===========================================
  //    Simplified writing for ease of use
  //===========================================
  get scene() {
    return this.root.scene;
  }

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
    this.root.setAlpha(value);
  }

  get visible() {
    return this.root.visible;
  }

  set visible(value: boolean) {
    this.root.setVisible(value);
  }
}

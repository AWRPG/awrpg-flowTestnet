import { ALIGNMODES } from "../../../constants";

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

  /** Width of this UI @readonly */
  width: number;

  /** Height of this UI @readonly */
  height: number;

  /** parent UI of this UI  */
  parent: UIBase | undefined;

  /** The horizontal distance (px) to the align position @readonly */
  marginX: number;

  /** The vertical distance (px) to the align position @readonly */
  marginY: number;

  /** The horizontal position of this UI @readonly */
  x: number;

  /** The vertical position of this UI @readonly */
  y: number;

  /** */
  constructor(
    scene: Phaser.Scene,
    width: number,
    height: number,
    {
      texture,
      alignModeName = ALIGNMODES.NONE,
      marginX = 0,
      marginY = 0,
      parent,
    }: {
      texture?: string | undefined;
      alignModeName?: string;
      marginX?: number;
      marginY?: number;
      parent?: UIBase;
    }
  ) {
    this.scene = scene;
    this.texture = texture;
    this.alignModeName = alignModeName;
    this.width = width;
    this.height = height;
    this.marginX = marginX;
    this.marginY = marginY;
    this.parent = parent;

    this.x = this.y = 0;
    this.adjustPositon();

    // Creates the root container and mounts it on the specified object
    this.root = new Phaser.GameObjects.Container(scene, this.x, this.y);
    if (parent) {
      parent.root.add(this.root);
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
   * Show the root container
   */
  show() {
    this.root.setVisible(true);
  }

  /**
   * Hide the root container
   */
  hide() {
    this.root.setVisible(false);
  }

  /**
   * Set coordinates according to alignment
   */
  adjustPositon() {
    const referObj = this.parent ?? this.scene;
    if (referObj === this.scene) {
    }
    switch (this.alignModeName) {
      case ALIGNMODES.LEFT_CENTER:
        this.x = this.marginX;
        this.y = referObj.height / 2 + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        this.x = this.marginX;
        this.y = referObj.height - this.marginY - this.height;
        break;
      case ALIGNMODES.RIGHT_TOP:
        this.x = referObj.width - this.marginX - this.width;
        this.y = this.marginY;
        break;
      case ALIGNMODES.RIGHT_CENTER:
        this.x = referObj.width - this.marginX - this.width;
        this.y = referObj.height / 2 + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.RIGHT_BOTTOM:
        this.x = referObj.width - this.marginX - this.width;
        this.y = referObj.height - this.marginY - this.height;
        break;
      case ALIGNMODES.MIDDLE_TOP:
        this.x = referObj.width / 2 + this.marginX - this.width / 2;
        this.y = this.marginY;
        break;
      case ALIGNMODES.MIDDLE_CENTER:
        this.x = referObj.width / 2 + this.marginX - this.width / 2;
        this.y = referObj.height / 2 + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.MIDDLE_BOTTOM:
        this.x = referObj.width / 2 + this.marginX - this.width / 2;
        this.y = referObj.height - this.marginY - this.height;
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
    this.adjustPositon();
    this.root.x = this.x;
    this.root.y = this.y;
  }

  /**
   * Modify alignment mode and synchronize position changes
   * @param name the name of alignMode you want to use
   */
  setAlignMode(name: string) {
    this.alignModeName = name;
    this.adjustPositon();
    this.root.x = this.x;
    this.root.y = this.y;
  }

  destroyChildren() {
    this.root.removeAll(true);
  }
}

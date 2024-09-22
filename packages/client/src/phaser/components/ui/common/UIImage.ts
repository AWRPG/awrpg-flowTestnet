import { UIBase, UIBaseConfig } from "./UIBase";

export interface UIImageConfig extends UIBaseConfig {
  nineSlice?: number;
  leftWidth?: number;
  rightWidth?: number;
  topHeight?: number;
  bottomHeight?: number;
}

export class UIImage extends UIBase {
  image: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice;

  constructor(
    scene: Phaser.Scene,
    texture: string,
    config: UIImageConfig = {}
  ) {
    super(scene, { texture, ...config });

    const { nineSlice, leftWidth, rightWidth, topHeight, bottomHeight } =
      config;

    if (
      [nineSlice, leftWidth, rightWidth, topHeight, bottomHeight].some(
        (value) => value !== undefined
      )
    ) {
      this.image = new Phaser.GameObjects.NineSlice(
        scene,
        0,
        0,
        texture,
        undefined,
        this.displayWidth / this.scale,
        this.displayHeight / this.scale,
        nineSlice ?? leftWidth ?? 0,
        nineSlice ?? rightWidth ?? 0,
        nineSlice ?? topHeight ?? 0,
        nineSlice ?? bottomHeight ?? 0
      ).setOrigin(0, 0); // [TODO] Make new nine slice way can let the side loop like the tilemap
    } else {
      this.image = new Phaser.GameObjects.Image(scene, 0, 0, texture);
      this.image.setOrigin(0, 0);
      this.image.setDisplaySize(
        this.displayWidth / this.scale,
        this.displayHeight / this.scale
      );
    }

    this.root.add(this.image);
  }

  /**
   * Sets the horizontal and vertical flipped state of this Game Object.
   * A Game Object that is flipped will render inversed on the flipped axis.
   * Flipping always takes place from the middle of the texture and does not impact the scale value.
   * If this Game Object has a physics body, it will not change the body. This is a rendering toggle only.
   * @param x The horizontal flipped state. `false` for no flip, or `true` to be flipped.
   * @param y The horizontal flipped state. `false` for no flip, or `true` to be flipped. If not set it will use the `x` value.
   */
  setFlip(x: boolean, y: boolean = x) {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return;
    this.image.setFlip(x, y);
  }

  /**
   * Sets the horizontal flipped state of this Game Object.
   * @param value The flipped state. `false` for no flip, or `true` to be flipped.
   */
  setFlipX(value: boolean) {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return;
    this.image.setFlipX(value);
  }

  /**
   * Sets the vertical flipped state of this Game Object.
   * @param value The flipped state. `false` for no flip, or `true` to be flipped.
   */
  setFlipY(value: boolean) {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return;
    this.image.setFlipY(value);
  }

  get flipX() {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return false;
    return this.image.flipX;
  }

  set flipX(value: boolean) {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return;
    this.image.setFlipX(value);
  }

  get flipY() {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return false;
    return this.image.flipY;
  }

  set flipY(value: boolean) {
    if (this.image instanceof Phaser.GameObjects.NineSlice) return;
    this.image.setFlipY(value);
  }
}

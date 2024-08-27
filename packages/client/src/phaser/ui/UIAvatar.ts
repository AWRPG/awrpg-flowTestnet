import { UIScene } from "../scenes/UIScene";
import { UIBase } from "./UIBase";

export class UIAvatar extends UIBase {
  avatar: Phaser.GameObjects.Sprite;
  constructor(
    scene: UIScene,
    texture: string,
    alignModeName: string,
    width: number = 128,
    height: number = 128,
    marginX: number = 0,
    marginY: number = 0,
    parent?: UIBase
  ) {
    super(
      scene,
      texture,
      alignModeName,
      width,
      height,
      marginX,
      marginY,
      parent
    );
    this.avatar = new Phaser.GameObjects.Sprite(scene, 0, 0, texture).setOrigin(
      0,
      0
    );
    const scaleValueX = this.width / this.avatar.width;
    const scaleValueY = this.height / this.avatar.height;
    this.avatar.setScale(scaleValueX, scaleValueY);
    this.avatar.setFlipX(true);
    this.root.add(this.avatar);
  }
}

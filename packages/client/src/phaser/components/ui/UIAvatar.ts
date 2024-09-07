import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";
import { ALIGNMODES } from "../../../constants";

export class UIAvatar extends UIBase {
  avatar: Phaser.GameObjects.Sprite;
  constructor(
    scene: UIScene,
    texture: string,
    width: number = 128,
    height: number = 128,
    {
      alignModeName = ALIGNMODES.NONE,
      marginX = 0,
      marginY = 0,
      parent,
    }: {
      alignModeName?: string;
      marginX?: number;
      marginY?: number;
      parent?: UIBase;
    }
  ) {
    super(scene, width, height, {
      texture,
      alignModeName,
      marginX,
      marginY,
      parent,
    });

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

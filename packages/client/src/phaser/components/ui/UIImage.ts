import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";
import { ALIGNMODES } from "../../../constants";

export class UIImage extends UIBase {
  image: Phaser.GameObjects.Image;
  constructor(
    scene: UIScene,
    texture: string,
    width: number = 96,
    height: number = 96,
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

    this.image = new Phaser.GameObjects.Image(scene, 0, 0, texture).setOrigin(
      0,
      0
    );
    const scaleValueX = this.width / this.image.width;
    const scaleValueY = this.height / this.image.height;
    this.image.setScale(scaleValueX, scaleValueY);
    this.root.add(this.image);
  }
}

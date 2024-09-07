import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";

export class UIImage extends UIBase {
  image: Phaser.GameObjects.Image;
  constructor(
    scene: UIScene,
    texture: string,
    alignModeName: string,
    width: number = 96,
    height: number = 96,
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
    this.image = new Phaser.GameObjects.Image(
      scene,
      0,
      0,
      texture,
      undefined
    ).setOrigin(0, 0);
    this.root.add(this.image);
  }
}

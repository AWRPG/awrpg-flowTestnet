import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";

export class Bar extends UIBase {
  textureEmpty: string;

  bar: Phaser.GameObjects.Sprite;

  empty: Phaser.GameObjects.Sprite;

  constructor(
    scene: UIScene,
    texture: string,
    textureEmpty: string,
    alignModeName: string,
    width: number = 192,
    height: number = 20,
    marginX: number = 0,
    marginY: number = 0,
    {
      value = 1,
      maxValue = 1,
    }: {
      value?: number;
      maxValue?: number;
    },
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
    this.textureEmpty = textureEmpty;
    this.bar = new Phaser.GameObjects.Sprite(scene, 0, 0, texture).setOrigin(
      0,
      0
    );
    // this.bar.setData("value", value);
    // this.bar.setData("maxValue", maxValue);
    const scaleValueX = this.width / this.bar.width;
    const scaleValueY = this.height / this.bar.height;
    this.bar.setScale(scaleValueX, scaleValueY);
    this.root.add(this.bar);

    // this.bar.on("changedata", this.onDataChanged);
  }

}

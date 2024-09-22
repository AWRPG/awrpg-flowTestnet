import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./common/UIBase";
import { ALIGNMODES } from "../../../constants";

/**
 * Graphical display of numerical percentages such as blood bars, stamina slots
 */
export class Bar extends UIBase {
  emptyTexture: string;

  bar: Phaser.GameObjects.Sprite;

  // empty: Phaser.GameObjects.Sprite; //[TODO]

  constructor(
    scene: UIScene,
    texture: string,
    emptyTexture: string,
    width: number = 192,
    height: number = 20,
    {
      alignModeName = ALIGNMODES.NONE,
      value = 1,
      maxValue = 1,
      marginX = 0,
      marginY = 0,
      parent,
    }: {
      alignModeName?: string;
      marginX?: number;
      marginY?: number;
      parent?: UIBase;
      value?: number;
      maxValue?: number;
    }
  ) {
    super(scene, {
      texture,
      alignModeName,
      width,
      height,
      marginX,
      marginY,
      parent,
    });

    this.emptyTexture = emptyTexture;
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

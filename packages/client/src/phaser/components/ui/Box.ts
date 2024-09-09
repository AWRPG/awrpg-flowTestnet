import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";
import { ALIGNMODES } from "../../../constants";

export class Box extends UIBase {
  box: Phaser.GameObjects.NineSlice;

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
      leftWidth = 32,
      rightWidth = 32,
      topHeight = 32,
      bottomHeight = 32,
    }: {
      alignModeName?: string;
      marginX?: number;
      marginY?: number;
      parent?: UIBase;
      leftWidth?: number;
      rightWidth?: number;
      topHeight?: number;
      bottomHeight?: number;
    }
  ) {
    super(scene, width, height, {
      texture,
      alignModeName,
      marginX,
      marginY,
      parent,
    });
    // [TODO] Made new nine slice way can let the side loop like the tilemap
    this.box = new Phaser.GameObjects.NineSlice(
      scene,
      0,
      0,
      texture,
      undefined,
      width,
      height,
      leftWidth,
      rightWidth,
      topHeight,
      bottomHeight
    ).setOrigin(0, 0);
    this.root.add(this.box);
  }
}

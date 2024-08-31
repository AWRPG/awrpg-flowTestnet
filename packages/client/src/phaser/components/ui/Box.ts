import { UIScene } from "../../scenes/UIScene";
import { UIBase } from "./UIBase";

export class Box extends UIBase {
  border: {
    leftWidth: number;
    rightWidth: number;
    topHeight: number;
    bottomHeight: number;
  } = { leftWidth: 32, rightWidth: 32, topHeight: 32, bottomHeight: 32 };

  box: Phaser.GameObjects.NineSlice;

  constructor(
    scene: UIScene,
    texture: string,
    alignModeName: string,
    width: number = 96,
    height: number = 96,
    marginX: number = 0,
    marginY: number = 0,
    border?: {
      leftWidth: number;
      rightWidth: number;
      topHeight: number;
      bottomHeight: number;
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
    if (border) this.border = border;
    // [TODO] Made new nine slice way can let the side loop like the tilemap
    this.box = new Phaser.GameObjects.NineSlice(
      scene,
      0,
      0,
      texture,
      undefined,
      width,
      height,
      this.border.leftWidth,
      this.border.rightWidth,
      this.border.topHeight,
      this.border.bottomHeight
    ).setOrigin(0, 0);
    this.root.add(this.box);
  }
}

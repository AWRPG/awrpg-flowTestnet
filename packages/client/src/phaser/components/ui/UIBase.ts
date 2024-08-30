import { Vector } from "../../../utils/vector";
import { ALIGNMODES } from "../../../constants";
import { UIScene } from "../../scenes/UIScene";

export class UIBase {
  root: Phaser.GameObjects.Container;

  scene: UIScene;

  texture: string | null;

  alignModeName: string;

  alignMode: Vector = { x: 0, y: 0 };

  width: number;

  height: number;

  marginX: number;

  marginY: number;

  x: number;

  y: number;

  parent: UIBase | undefined;

  constructor(
    scene: UIScene,
    texture: string | null,
    alignModeName: string,
    width: number,
    height: number,
    marginX: number,
    marginY: number,
    parent?: UIBase
  ) {
    this.scene = scene;
    this.texture = texture;
    this.alignModeName = alignModeName;
    this.width = width;
    this.height = height;
    this.marginX = marginX;
    this.marginY = marginY;
    this.parent = parent;

    switch (alignModeName) {
      case ALIGNMODES.LEFT_TOP:
        this.alignMode = { x: 0, y: 0 };
        this.x = this.marginX;
        this.y = this.marginY + this.height;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        this.alignMode = parent
          ? { x: 0, y: parent.height }
          : { x: 0, y: scene.height };
        this.x = this.marginX;
        this.y = this.alignMode.y - this.marginY - this.height;
        break;
      default:
        this.alignMode = { x: 0, y: 0 };
        this.x = this.marginX;
        this.y = this.marginY;
        break;
    }
    this.root = new Phaser.GameObjects.Container(scene, this.x, this.y);
    if (parent) {
      parent.root.add(this.root);
    } else {
      scene.add.existing(this.root);
    }
  }

  add(children: UIBase | UIBase[]) {
    if (Array.isArray(children)) {
      for (const i in children) this.root.add(children[i].root);
    } else {
      this.root.add(children.root);
    }
  }
}

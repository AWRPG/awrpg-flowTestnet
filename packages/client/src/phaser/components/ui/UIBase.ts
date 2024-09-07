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
        this.y = this.marginY;
        break;
      case ALIGNMODES.LEFT_CENTER:
        this.alignMode = parent
          ? { x: 0, y: parent.height / 2 }
          : { x: 0, y: scene.height / 2 };
        this.x = this.marginX;
        this.y = this.alignMode.y + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.LEFT_BOTTOM:
        this.alignMode = parent
          ? { x: 0, y: parent.height }
          : { x: 0, y: scene.height };
        this.x = this.marginX;
        this.y = this.alignMode.y - this.marginY - this.height;
        break;
      case ALIGNMODES.RIGHT_TOP:
        this.alignMode = parent
          ? { x: parent.width, y: 0 }
          : { x: scene.width, y: 0 };
        this.x = this.alignMode.x - this.marginX - this.width;
        this.y = this.marginY;
        break;
      case ALIGNMODES.RIGHT_CENTER:
        this.alignMode = parent
          ? { x: parent.width, y: parent.height / 2 }
          : { x: scene.width, y: scene.height / 2 };
        this.x = this.alignMode.x - this.marginX - this.width;
        this.y = this.alignMode.y + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.RIGHT_BOTTOM:
        this.alignMode = parent
          ? { x: parent.width, y: parent.height }
          : { x: scene.width, y: scene.height };
        this.x = this.alignMode.x - this.marginX - this.width;
        this.y = this.alignMode.y - this.marginY - this.height;
        break;
      case ALIGNMODES.MIDDLE_TOP:
        this.alignMode = parent
          ? { x: parent.width / 2, y: 0 }
          : { x: scene.width / 2, y: 0 };
        this.x = this.alignMode.x + this.marginX - this.width / 2;
        this.y = this.marginY;
        break;
      case ALIGNMODES.MIDDLE_CENTER:
        this.alignMode = parent
          ? { x: parent.width / 2, y: parent.height / 2 }
          : { x: scene.width / 2, y: scene.height / 2 };
        this.x = this.alignMode.x + this.marginX - this.width / 2;
        this.y = this.alignMode.y + this.marginY - this.height / 2;
        break;
      case ALIGNMODES.MIDDLE_BOTTOM:
        this.alignMode = parent
          ? { x: parent.width / 2, y: parent.height}
          : { x: scene.width / 2, y: scene.height };
        this.x = this.alignMode.x + this.marginX - this.width / 2;
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

  show() {
    this.root.setVisible(true);
  }

  hide() {
    this.root.setVisible(false);
  }
}

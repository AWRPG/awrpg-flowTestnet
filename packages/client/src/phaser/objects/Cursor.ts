import { ClientComponents } from "../../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";

export class Cursor extends SceneObject {
  cursor: Phaser.GameObjects.Sprite;
  constructor(entity: Entity, scene: GameScene, components: ClientComponents) {
    super(entity, components, scene);

    this.root.setPosition(this.x, this.y);
    this.cursor = new Phaser.GameObjects.Sprite(scene, 0, 0, "ui-cursor")
      .setScale(0.5)
      .play("ui-cursor-active");
    this.root.add(this.cursor).setDepth(14);
    this.follow();
  }
}

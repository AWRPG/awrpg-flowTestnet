import { ClientComponents } from "../../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { UIController } from "../components/controllers/UIController";

export class Cursor extends SceneObject {
  cursor: Phaser.GameObjects.Sprite;
  constructor(scene: GameScene, entity: Entity) {
    super(scene, entity);
    this.cursor = new Phaser.GameObjects.Sprite(scene, 0, 0, "ui-cursor")
      .setScale(0.5)
      .play("ui-cursor-active");
    this.root.add(this.cursor);
    this.setDepth(5001);
    this.follow();
  }

  moveTo(
    toX: number,
    toY: number,
    duration: number = 90,
    onComplete?: () => void
  ) {
    super.moveTo(toX, toY, duration, onComplete);
    UIController.scene?.terrainUI?.update();
  }
}

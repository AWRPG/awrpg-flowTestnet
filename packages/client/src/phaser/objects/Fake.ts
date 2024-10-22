import { Entity } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { GameObjects } from "phaser";

export interface FakeConfig {
  texture: string;
  width?: number;
  height?: number;
}

export class Fake extends SceneObject {
  sprite?: GameObjects.Sprite;
  constructor(scene: GameScene, entity: Entity, config: FakeConfig) {
    super(scene, entity);
    this.fake = true;
    this.sprite = new GameObjects.Sprite(scene, 0, 0, config.texture);
    const offsetX = config.width ? 0.5 / config.width : 0;
    const offsetY = config.height ? 0.5 / config.height : 0;
    this.sprite.setOrigin(offsetX, offsetY);
    this.root.add(this.sprite);
  }

  flickerEffect() {
    this.root.alpha = 0.85;
    this.scene.tweens.add({
      targets: this.root,
      alpha: 0.7,
      duration: 800,
      repeat: -1,
      yoyo: true,
    });
  }
}

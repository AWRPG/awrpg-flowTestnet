import { SceneObject } from "./SceneObject";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";

export class TileHighlight extends SceneObject {
  /**
   * objects to show the highlight
   */
  highlights: Phaser.GameObjects.Sprite[] = [];

  /**
   * the distance of each sides
   */
  distance: number = 0;

  /**
   * distinguish between different types of highlighting ranges
   * 0: move, 1: attack, 2: move & attack
   */
  type: number = 0;

  /**
   * [TODO]
   * @param entity
   * @param components
   * @param scene
   */
  constructor(
    entity: Entity,
    components: ClientComponents,
    scene: GameScene,
    { canControl }: { canControl: boolean }
  ) {
    super(entity, components, scene);
    const path = getComponentValue(components.Path, entity) ?? {
      toTileX: 0,
      toTileY: 0,
    };
    this.tileX = path.toTileX;
    this.tileY = path.toTileY;
    this.root
      .setPosition(
        (this.tileX + 0.5) * this.tileSize,
        (this.tileY + 0.5) * this.tileSize
      )
      .setDepth(2);
    // Get the type of highlight
    if (canControl) {
      this.type = 0;
    }
    // Get the distance from entity
    this.distance = 5;
    // Calc the tiles to highlight
    for (let i = -this.distance; i <= this.distance; i++) {
      for (
        let j = -this.distance + Math.abs(i);
        j <= this.distance - Math.abs(i);
        j++
      ) {
        const highlight = new Phaser.GameObjects.Sprite(
          this.scene,
          i * this.tileSize,
          j * this.tileSize,
          "ui-cursor"
        );
        this.highlights.push(highlight);
        this.root.add(highlight);
      }
    }
  }

  destroy() {
    for (const i in this.highlights) {
      this.highlights[i].destroy();
    }
  }
}

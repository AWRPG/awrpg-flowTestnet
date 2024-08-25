import { ClientComponents } from "../../mud/createClientComponents";
import {
  Direction,
  movesToPositions,
  splitFromEntity,
} from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";
import { Hex } from "viem";
import { getPool } from "../../contract/hashes";
import { getPoolAmount, getPoolCapacity } from "../../logics/pool";
import {
  POOL_COLORS,
  POOL_TYPES,
  SOURCE,
  terrainMapping,
} from "../../constants";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { Vector } from "../../utils/vector";

/**
 * About the scene object with avatar such as character or building
 */
export class Tile extends SceneObject {
  tile: Phaser.GameObjects.Sprite;
  terrain: number = 0;

  cursor: Phaser.GameObjects.Sprite | undefined;

  constructor(
    scene: GameScene,
    components: ClientComponents,
    {
      entity,
      terrain,
      onClick,
    }: {
      entity: Entity;
      terrain: number;
      onClick: () => void;
    }
  ) {
    super(entity, components, scene);
    this.terrain = terrain;
    const tileCoord = splitFromEntity(entity);
    this.tileX = tileCoord.x;
    this.tileY = tileCoord.y;
    this.root
      .setPosition(
        (this.tileX + 0.5) * this.tileSize,
        (this.tileY + 0.5) * this.tileSize
      )
      .setDepth(1);
    this.tile = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      terrainMapping[terrain]
    )
      .setInteractive()
      .on("pointerdown", () =>
        console.log("tile", this.root.x, this.root.y, terrain)
      );
    this.root.add(this.tile);
  }

  select() {
    this.cursor = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      "ui-cursor"
    ).play("ui-cursor-active");
    this.root.add(this.cursor);
  }

  unselect() {
    this.cursor?.destroy();
  }

  destroy() {
    this.tile.destroy();
  }
}

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
    const x = this.tileSize * tileCoord.x + this.tileSize / 2;
    const y = this.tileSize * tileCoord.y + this.tileSize / 2;
    this.tile = scene.add
      .sprite(x, y, terrainMapping[terrain])
      .setInteractive()
      .on("pointerdown", () => console.log("tile", x, y, terrain));
  }

  select() {
    this.tile.setTint(0xff0000);
  }

  unselect() {
    this.tile.clearTint();
  }

  destroy() {
    this.tile.destroy();
  }
}

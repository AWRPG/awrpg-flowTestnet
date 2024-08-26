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
  // tile: Phaser.GameObjects.Sprite;
  tileSrpites: Record<number, Phaser.GameObjects.TileSprite> = {};
  tileValue: string[];
  terrain: number = 0;

  constructor(
    scene: GameScene,
    components: ClientComponents,
    {
      entity,
      terrain,
      tileValue,
      onClick,
    }: {
      entity: Entity;
      terrain?: number;
      tileValue: string[];
      onClick: () => void;
    }
  ) {
    super(entity, components, scene);
    this.tileValue = tileValue;
    const tileCoord = splitFromEntity(entity);
    const x = this.tileSize * tileCoord.x + this.tileSize / 2;
    const y = this.tileSize * tileCoord.y + this.tileSize / 2;
    // if (terrainMapping[terrain] === "forest") {
    //   this.tile = scene.add.tileSprite(x, y, 16, 16, "grass_0_2");
    // } else {
    // const tileValues = tileValue.split("&");
    tileValue.forEach((tile, index) => {
      const [texture, frame] = tile.split("&");
      // console.log("tile", x, y, texture, frame);
      const tileSprite = scene.add
        .tileSprite(x, y, 16, 16, texture, frame ?? "")
        .setDepth(index);
      this.tileSrpites[index] = tileSprite;
    });

    // console.log("tile", x, y, tileValue);
    // this.tile.anims.play("grass_0_2");
  }

  select() {
    this.tileSrpites[0].setTint(0xff0000);
  }

  unselect() {
    this.tileSrpites[0].clearTint();
  }

  destroy() {
    Object.values(this.tileSrpites).forEach((sprite) => sprite.destroy());
  }
}

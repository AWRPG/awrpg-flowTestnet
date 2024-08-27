import { Vector, getRectangleCoords } from "../../utils/vector";
import { SceneObject } from "./SceneObject";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { SystemCalls } from "../../mud/createSystemCalls";
import { GameScene } from "../scenes/GameScene";
import {
  getGridTerrains,
  GRID_SIZE,
  TileTerrainMap,
} from "../../logics/terrain";
import { combineToEntity } from "../../logics/move";
import { TerrainType } from "../../constants";

export class TileHighlight extends SceneObject {
  /**
   * objects to show the highlight
   */
  highlights: Phaser.GameObjects.Sprite[] = [];

  /**
   * the tiles really can interact
   */
  legalTiles: boolean[][] = [];

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
    {
      canControl,
      systemCalls,
    }: { canControl: boolean; systemCalls: SystemCalls }
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
      .setAlpha(1)
      .setDepth(12);
    // Get the type of highlight
    if (canControl) {
      this.type = 0;
    }
    // Get the distance from entity
    this.distance = 5;
    // Get the data from grids
    const leftTopGridCoord = {
      x: Math.floor((this.tileX - this.distance) / GRID_SIZE),
      y: Math.floor((this.tileY - this.distance) / GRID_SIZE),
    };
    const rightBottomGridCoord = {
      x: Math.floor((this.tileX + this.distance) / GRID_SIZE),
      y: Math.floor((this.tileY + this.distance) / GRID_SIZE),
    };
    const gridCoords = getRectangleCoords(
      leftTopGridCoord,
      rightBottomGridCoord
    );
    let terrains: TileTerrainMap[] = [];
    gridCoords.forEach((coord) => {
      const gridId = combineToEntity(coord.x, coord.y);
      terrains = terrains.concat(getGridTerrains(components, gridId));
    });
    // Calc the tiles to highlight
    for (let i = -this.distance; i <= this.distance; i++) {
      this.legalTiles[this.tileX + i] = [];
      for (
        let j = -this.distance + Math.abs(i);
        j <= this.distance - Math.abs(i);
        j++
      ) {
        this.legalTiles[this.tileX + i][this.tileY + j] = true;
      }
    }
    for (const i in terrains) {
      if (
        terrains[i].terrainType !== TerrainType.PLAIN &&
        this.legalTiles[terrains[i].x] &&
        this.legalTiles[terrains[i].x][terrains[i].y]
      ) {
        this.legalTiles[terrains[i].x][terrains[i].y] = false;
      }
    }

    for (let i = -this.distance; i <= this.distance; i++) {
      for (
        let j = -this.distance + Math.abs(i);
        j <= this.distance - Math.abs(i);
        j++
      ) {
        if (this.legalTiles[this.tileX + i][this.tileY + j]) {
          const highlight = new Phaser.GameObjects.Sprite(
            this.scene,
            i * this.tileSize,
            j * this.tileSize,
            "ui-highlight"
          )
            .setScale(0.45)
            .play("ui-highlight-active");
          this.highlights.push(highlight);
          this.root.add(highlight);
        }
      }
    }
  }

  destroy() {
    for (const i in this.highlights) {
      this.highlights[i].destroy();
    }
  }
}

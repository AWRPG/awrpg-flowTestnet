import { Vector, getRectangleCoords } from "../../utils/vector";
import { SceneObject } from "./SceneObject";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import {
  getGridTerrains,
  GRID_SIZE,
  TileTerrainMap,
} from "../../logics/terrain";
import { combineToEntity } from "../../logics/move";
import { TerrainType } from "../../constants";
import { dijkstraPathfinding } from "../../utils/pathFinding";

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
    { canControl }: { canControl: boolean }
  ) {
    super(entity, components, scene);

    // Set the center position to root
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
    this.distance = 7;

    console.log("TileHighlight");

    // Get the datas of square area by left-top & right-bottom points
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

    // Get the reachable area
    console.log("Get the reachable area", terrains);
    for (const i in terrains) {
      // Check the terrain type
      // console.log("terrainType:", terrains[i].terrainType);
      if (terrains[i].terrainType === TerrainType.NONE) continue;
      if (terrains[i].terrainType === TerrainType.OCEAN) continue;
      if (terrains[i].terrainType === TerrainType.FOREST) continue;
      if (terrains[i].terrainType === TerrainType.MOUNTAIN) continue;
      // Check the distance
      const xTemp = terrains[i].x - this.tileX;
      const yTemp = terrains[i].y - this.tileY;
      const distanceTemp = Math.abs(xTemp) + Math.abs(yTemp);
      // console.log("distanceTemp:", distanceTemp);
      if (distanceTemp > this.distance) continue;
      // Check the path legal
      console.log("Check the path legal");
      const pathCoords = dijkstraPathfinding(
        { x: this.tileX, y: this.tileY },
        { x: terrains[i].x, y: terrains[i].y },
        terrains
      );
      console.log("pathCoords:", pathCoords);
      if (pathCoords === null) continue;
      if (!this.legalTiles[xTemp])
        // Add
        this.legalTiles[xTemp] = [];
      this.legalTiles[xTemp][yTemp] = true;
    }

    // Show
    for (const i in this.legalTiles) {
      for (const j in this.legalTiles[i]) {
        console.log("coord:", i, j);
        const highlight = new Phaser.GameObjects.Sprite(
          this.scene,
          Number(i) * this.tileSize,
          Number(j) * this.tileSize,
          "ui-highlight"
        )
          .setScale(0.45)
          .play("ui-highlight-active");
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

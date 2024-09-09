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
import { HIGHLIGHT_MODE, TerrainType } from "../../constants";
import { dijkstraPathfinding } from "../../utils/pathFinding";

export class TileHighlight extends SceneObject {
  /**
   * objects to show the highlight
   */
  highlightObjs: Phaser.GameObjects.Sprite[] = [];

  highlightData: { x: number; y: number; distance: number }[] = [];

  /**
   * distinguish between different types of highlighting ranges
   */
  mode: string = HIGHLIGHT_MODE.MOVE;

  /** */
  constructor(
    entity: Entity,
    components: ClientComponents,
    scene: GameScene,
    mode?: string
  ) {
    super(entity, components, scene);
    const path = getComponentValue(components.Path, entity) ?? null;
    if (!path) return;
    this.tileX = path.toX;
    this.tileY = path.toY;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;
    this.root.setPosition(this.x, this.y).setDepth(12);
    this.root.setVisible(false);
  }

  async calcHighlight() {
    if (this.highlightData && this.highlightData.length > 0) return;
    console.log("calcHighlight");
    if (this.mode === HIGHLIGHT_MODE.MOVE) {
      const distance = 20; // Get the distance from entity
      const leftTopGridCoord = {
        x: Math.floor((this.tileX - distance) / GRID_SIZE),
        y: Math.floor((this.tileY - distance) / GRID_SIZE),
      }; // Get the datas of square area by left-top & right-bottom points
      const rightBottomGridCoord = {
        x: Math.floor((this.tileX + distance) / GRID_SIZE),
        y: Math.floor((this.tileY + distance) / GRID_SIZE),
      };
      const gridCoords = getRectangleCoords(
        leftTopGridCoord,
        rightBottomGridCoord
      );
      let terrains: TileTerrainMap[] = [];
      gridCoords.forEach((coord) => {
        const gridId = combineToEntity(coord.x, coord.y);
        terrains = terrains.concat(getGridTerrains(this.components, gridId));
      });
      // Check the terrain type
      const passableTiles: Set<string> = new Set();
      for (const i in terrains) {
        if (terrains[i].terrainType === TerrainType.NONE) continue;
        if (terrains[i].terrainType === TerrainType.OCEAN) continue;
        if (terrains[i].terrainType === TerrainType.FOREST) continue;
        if (terrains[i].terrainType === TerrainType.MOUNTAIN) continue;
        const xTemp = terrains[i].x - this.tileX;
        const yTemp = terrains[i].y - this.tileY;
        const distanceTemp = Math.abs(xTemp) + Math.abs(yTemp);
        if (distanceTemp > distance) continue;
        passableTiles.add(`${xTemp},${yTemp}`);
      }
      // Get the reachable area
      this.highlightData = this.floodFill(distance, passableTiles);
    } else if (this.mode === HIGHLIGHT_MODE.BUILD) {
      //
    }
  }

  floodFill(maxDistance: number, passableTiles: Set<string>) {
    const queue: { x: number; y: number; distance: number }[] = [
      { x: 0, y: 0, distance: 0 },
    ];
    const visited = new Set([`${0},${0}`]);
    const reachable = [];
    while (queue.length > 0) {
      const tile = queue.shift();
      if (!tile) continue;
      const { x, y, distance } = tile;
      if (distance > maxDistance) continue;
      reachable.push({ x, y, distance });
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (!visited.has(`${nx},${ny}`) && passableTiles.has(`${nx},${ny}`)) {
          queue.push({ x: nx, y: ny, distance: distance + 1 });
          visited.add(`${nx},${ny}`);
        }
      }
    }
    return reachable;
  }

  setHighlight() {
    this.clearHighlight();
    if (this.mode === HIGHLIGHT_MODE.MOVE) {
      this.highlightData.forEach((data) => {
        const highlight = new Phaser.GameObjects.Sprite(
          this.scene,
          data.x * this.tileSize,
          data.y * this.tileSize,
          "ui-highlight-move"
        );
        highlight.setScale(0);
        this.highlightObjs.push(highlight);
        this.root.add(highlight);
        setTimeout(() => {
          this.scene.tweens.add({
            targets: highlight,
            props: { ["scale"]: 1 },
            duration: 120,
          });
        }, data.distance * 80);
      });
    } else if (this.mode === HIGHLIGHT_MODE.BUILD) {
      //
    }
  }

  clearHighlight() {
    this.highlightObjs.forEach((obj) => {
      obj.destroy();
    });
    this.highlightObjs = [];
  }

  show(alpha: number = 1) {
    this.root.alpha = alpha;
    if (this.root.visible !== true) {
      this.setHighlight();
      this.root.setVisible(true);
    }
  }

  hide() {
    this.root.setVisible(false);
    this.clearHighlight();
  }
}

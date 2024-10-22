import { getRectangleCoords } from "../../utils/vector";
import { SceneObject } from "./SceneObject";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import {
  getGridTerrains,
  GRID_SIZE,
  TileTerrainMap,
} from "../../logics/terrain";
import { combineToEntity, Direction } from "../../logics/move";
import { HIGHLIGHT_MODE, TerrainType } from "../../constants";

export class TileHighlight extends SceneObject {
  /**
   * objects to show the highlight
   */
  highlightObjs: Phaser.GameObjects.Sprite[] = [];

  highlightData: { x: number; y: number; distance: number; type?: string }[] =
    [];

  /**
   * distinguish between different types of highlighting ranges
   */
  mode: string;

  /** */
  constructor(
    entity: Entity,
    components: ClientComponents,
    scene: GameScene,
    mode: string = HIGHLIGHT_MODE.MOVE
  ) {
    super(scene, entity);
    this.mode = mode;
    const path = getComponentValue(components.Path, entity) ?? null;
    if (!path) return;
    this.tileX = path.toX;
    this.tileY = path.toY;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;
    this.root.setPosition(this.x, this.y).setDepth(12);
    this.root.setVisible(false);
  }

  calcHighlight({
    distance = 20,
    width = 1,
    height = 1,
  }: {
    distance?: number;
    width?: number;
    height?: number;
  } = {}) {
    if (this.highlightData && this.highlightData.length > 0) return;
    if (this.mode === HIGHLIGHT_MODE.MOVE) {
      const terrains = this.getTerrains(distance, width, height); // Get terrains by the distance
      const passableTiles = this.getPassableTiles(terrains, distance);
      this.highlightData = this.floodFill(distance, passableTiles); // Get the reachable area
    } else if (this.mode === HIGHLIGHT_MODE.BUILD) {
      const terrains = this.getTerrains(distance, width, height); // Distance: the side
      terrains.forEach((terrain) => {
        const type =
          terrain.terrainType === TerrainType.NONE ||
          terrain.terrainType === TerrainType.OCEAN ||
          terrain.terrainType === TerrainType.FOREST ||
          terrain.terrainType === TerrainType.MOUNTAIN
            ? "error"
            : "build";
        const xTemp = terrain.x - this.tileX;
        const yTemp = terrain.y - this.tileY;
        const distanceTemp = Math.abs(xTemp) + Math.abs(yTemp);
        if (
          distanceTemp === 0 ||
          distance <
            Math.max(Math.abs(xTemp) - width + 1, 0) +
              Math.max(Math.abs(yTemp) - height + 1, 0)
        )
          return;
        this.highlightData.push({
          x: xTemp,
          y: yTemp,
          distance: distanceTemp,
          type,
        });
      });
    }
  }

  getTerrains(
    distance: number,
    width: number,
    height: number
  ): TileTerrainMap[] {
    // Get the datas of square area by left-top & right-bottom points
    const leftTopGridCoord = {
      x: Math.floor((this.tileX - distance - width + 1) / GRID_SIZE),
      y: Math.floor((this.tileY - distance - height + 1) / GRID_SIZE),
    };
    const rightBottomGridCoord = {
      x: Math.floor((this.tileX + distance + width - 1) / GRID_SIZE),
      y: Math.floor((this.tileY + distance + height - 1) / GRID_SIZE),
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
    return terrains;
  }

  getPassableTiles(terrains: TileTerrainMap[], distance: number): Set<string> {
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
    return passableTiles;
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
    this.highlightData.forEach((data) => {
      const highlight = new Phaser.GameObjects.Sprite(
        this.scene,
        data.x * this.tileSize,
        data.y * this.tileSize,
        "ui-highlight-" + (data.type ?? "move")
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
  }

  clearHighlight() {
    this.highlightObjs.forEach((obj) => {
      obj.destroy();
    });
    this.highlightObjs = [];
  }

  clearPartHighlight(coords: { x: number; y: number }[]) {
    this.highlightObjs.forEach((highlight) => {
      let leftFlag = false;
      coords.forEach((coord) => {
        if (
          highlight.x / this.tileSize === coord.x &&
          highlight.y / this.tileSize === coord.y
        ) {
          leftFlag = true;
        }
      });
      if (!leftFlag) {
        highlight.alpha = 0.5;
        this.scene.tweens.add({
          targets: highlight,
          scale: highlight.scale * 0.8,
          alpha: 0,
          duration: 200,
          onComplete: () => highlight.destroy(),
        });
      }
    });
  }

  changeTypeByCoords(type: string, coords: { x: number; y: number }[]) {
    this.highlightObjs.forEach((highlight) => {
      coords.forEach((coord) => {
        if (
          highlight.x / this.tileSize === coord.x &&
          highlight.y / this.tileSize === coord.y
        ) {
          highlight.setTexture("ui-highlight-" + type);
        }
      });
    });
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

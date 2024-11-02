import { getRectangleCoords } from "../../utils/vector";
import { SceneObject } from "./SceneObject";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import {
  getGridTerrains,
  getTerrainType,
  GRID_SIZE,
  TileTerrainMap,
} from "../../logics/terrain";
import { combineToEntity } from "../../logics/move";
import { HIGHLIGHT_MODE, TerrainType } from "../../constants";
import { MAX_MOVES } from "../../contract/constants";
import { isRole, isBuilding, getEntitySpecs } from "../../logics/entity";
import { getEntityOnCoord } from "../../logics/map";

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
    // On the scene or in a building
    const path =
      getComponentValue(components.Path, entity) ??
      (this.scene.cursor
        ? {
            toX: this.scene.cursor.tileX,
            toY: this.scene.cursor.tileY,
          }
        : null);
    if (!path) return;
    this.tileX = path.toX;
    this.tileY = path.toY;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;
    this.setPosition(this.x, this.y).setDepth(5000);
    this.visible = false;
  }

  calcHighlight({
    distance = MAX_MOVES,
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
      this.highlightData = this.highlightData.filter((data) => {
        const something = getEntityOnCoord(this.components, {
          x: data.x + this.tileX,
          y: data.y + this.tileY,
        });
        if (something) {
          const type = isRole(this.components, something)
            ? "role"
            : isBuilding(this.components, something)
              ? "building"
              : "other";
          if (type === "building") {
            data.type = "enter";
          }
          return type !== "role";
        }
        return true;
      });
    } else if (this.mode === HIGHLIGHT_MODE.BUILD) {
      const terrains = this.getTerrains(distance, width, height); // Distance: the side
      terrains.forEach((terrain) => {
        let type =
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

        const something = getEntityOnCoord(this.components, {
          x: terrain.x,
          y: terrain.y,
        });
        if (something) type = "error";
        this.highlightData.push({
          x: xTemp,
          y: yTemp,
          distance: distanceTemp,
          type,
        });
      });
    } else if (this.mode === HIGHLIGHT_MODE.MOVEOUT) {
      const entity = getEntityOnCoord(this.components, {
        x: this.tileX,
        y: this.tileY,
      });
      // const buildingType = getComponentValue(this.components.EntityType, entity)
      //   ?.value as Hex;
      const terrains: TileTerrainMap[] = this.getTilesAroundBuilding(entity);
      this.highlightData = terrains
        .filter((terrain) => {
          if (
            terrain.terrainType === TerrainType.NONE ||
            terrain.terrainType === TerrainType.OCEAN ||
            terrain.terrainType === TerrainType.FOREST ||
            terrain.terrainType === TerrainType.MOUNTAIN
          ) {
            return false;
          } else {
            const something = getEntityOnCoord(this.components, {
              x: terrain.x,
              y: terrain.y,
            });
            if (something) return false;
            return true;
          }
        })
        .map((terrain) => {
          return {
            x: terrain.x - (this.scene.cursor?.tileX ?? 0),
            y: terrain.y - (this.scene.cursor?.tileY ?? 0),
            distance: 0,
            type: "enter",
          };
        });
    }
  }

  getTilesAroundBuilding(entity: Entity) {
    const building = this.scene.buildings[entity];
    const buildingSpecs = getEntitySpecs(
      this.components,
      this.components.BuildingSpecs,
      entity
    );
    if (!buildingSpecs) return [];

    // the building object's position is based on the left-bottom corner
    const { width, height } = buildingSpecs;
    const tiles: TileTerrainMap[] = [];
    for (let i = -1; i <= width; i++) {
      for (let j = -height; j <= 1; j++) {
        if (i >= 0 && i < width && j > -height && j < 1) continue; // Avoid building self
        const x = building.tileX + i;
        const y = building.tileY + j;
        const terrainType = getTerrainType(this.components, this.systemCalls, {
          x,
          y,
        });
        tiles.push({ x, y, terrainType });
      }
    }
    return tiles;
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
      highlight.setData("type", data.type ?? "move");
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
    this.setDepth(2);
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

  recoveryType(coords: { x: number; y: number }[]) {
    this.highlightObjs.forEach((highlight) => {
      coords.forEach((coord) => {
        if (
          highlight.x / this.tileSize === coord.x &&
          highlight.y / this.tileSize === coord.y
        ) {
          const type = highlight.getData("type");
          highlight.setTexture("ui-highlight-" + type);
        }
      });
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

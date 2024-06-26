import {
  Entity,
  Has,
  UpdateType,
  defineSystem,
  getComponentValue,
} from "@latticexyz/recs";
import { SetupResult } from "../../mud/setup";
import Phaser from "phaser";
import { combine, split } from "../../logics/move";
import { TerrainType, terrainMapping } from "../../constants";

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  tileSize = 32;

  tilesLayer0: Record<Entity, Phaser.GameObjects.Sprite> = {};
  tiles: Record<Entity, Phaser.GameObjects.Sprite> = {};

  // map: Phaser.Tilemaps.Tilemap;
  // layer: Phaser.Tilemaps.TilemapLayer;

  constructor(
    setupResult: SetupResult,
    config?: Phaser.Types.Scenes.SettingsConfig
  ) {
    super(config);
    this.network = setupResult.network;
    this.components = setupResult.components;
    this.systemCalls = setupResult.systemCalls;
  }

  preload() {
    this.load.image("bush", "src/assets/tiles/Bush.png");
    this.load.image("grass", "src/assets/tiles/Grass.png");
    this.load.image("rock", "src/assets/tiles/Rock.png");
    this.load.image("tree", "src/assets/tiles/Tree.png");
    this.load.image("water", "src/assets/tiles/Water.png");
    this.load.image("stump", "src/assets/tiles/Stump.png");
    this.load.atlas(
      "host1",
      "src/assets/hosts/sprites/host1.png",
      "src/assets/hosts/sprites/host1.json"
    );
  }

  create() {
    const { TerrainValue } = this.components;
    const world = this.network.world;
    this.createAnimations();

    defineSystem(world, [Has(TerrainValue)], ({ entity, type }) => {
      const { x, y } = split(BigInt(entity));
      if (type === UpdateType.Exit) {
        return this.unloadTile(x, y);
      }

      const value = getComponentValue(TerrainValue, entity)!.value;
      this.loadTile(x, y, value);
      // console.log(value);
    });
  }

  loadTile(x: number, y: number, terrain: number) {
    const tileX = x * this.tileSize;
    const tileY = y * this.tileSize;
    const tile = this.add.sprite(tileX, tileY, terrainMapping[terrain]);
    const entity = combine(x, y) as Entity;
    this.tiles[entity] = tile;
    // handle 0 layer
    if (terrain === TerrainType.Rock) {
      const tile0 = this.add.sprite(tileX, tileY, "water").setDepth(-1);
      this.tilesLayer0[entity] = tile0;
    } else if (terrain !== TerrainType.Water && terrain !== TerrainType.Grass) {
      const tile0 = this.add.sprite(tileX, tileY, "grass").setDepth(-1);
      this.tilesLayer0[entity] = tile0;
    }
  }

  unloadTile(x: number, y: number) {
    const entity = combine(x, y) as Entity;
    const tile = this.tiles[entity];
    tile?.destroy();
    delete this.tiles[entity];
    this.tilesLayer0[entity]?.destroy();
    delete this.tilesLayer0[entity];
  }

  update() {}

  createAnimations() {
    this.anims.create({
      key: "host1-walk-down",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 0,
        end: 2,
        suffix: ".png",
      }),
    });
    this.anims.create({
      key: "host1-walk-left",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 3,
        end: 5,
        suffix: ".png",
      }),
    });
    this.anims.create({
      key: "host1-walk-right",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 6,
        end: 8,
        suffix: ".png",
      }),
    });
    this.anims.create({
      key: "host1-walk-up",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 9,
        end: 11,
        suffix: ".png",
      }),
    });
  }

}

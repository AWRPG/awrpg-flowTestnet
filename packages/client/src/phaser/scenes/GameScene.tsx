import {
  Entity,
  Has,
  HasValue,
  Not,
  UpdateType,
  defineSystem,
  getComponentValue,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { SetupResult } from "../../mud/setup";
import Phaser from "phaser";
import {
  Direction,
  calculatePathCoords,
  combine,
  movesToPositions,
  setNewTargetTile,
  split,
  splitFromEntity,
  updateMoves,
} from "../../logics/move";
import {
  BUILDING_TYPES,
  EXPLORE_MENU,
  MAIN_MENU,
  MENU,
  SOURCE,
  TerrainType,
  buildingMapping,
  terrainMapping,
} from "../../constants";
import { Host } from "../objects/Host";
import { POOL } from "../../contract/constants";
import { Hex } from "viem";
import { selectFirstHost, selectNextHost } from "../../logics/entity";
import { GRID_SIZE } from "../../logics/terrain";
import { Tile } from "../objects/Tile";

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  tileSize = 32;
  minZoomLevel = 1 / 2;
  maxZoomLevel = 4;

  tilesLayer0: Record<Entity, Phaser.GameObjects.Sprite> = {};
  tiles: Record<Entity, Tile> = {};
  // source entityId -> tileCoordId
  selectedTiles: Record<Entity, Entity> = {};
  buildings: Record<Entity, Phaser.GameObjects.Sprite> = {};

  hosts: Record<Entity, Host> = {};

  hostTextures: {
    key: string;
    url: string;
    frameWidth?: number;
    frameHeight?: number;
  }[] = [];

  tapDuration = 60;
  keyDownTime: number | null = null;

  constructor(
    setupResult: SetupResult,
    config?: Phaser.Types.Scenes.SettingsConfig
  ) {
    super({ ...config, key: "GameScene", active: true });
    this.network = setupResult.network;
    this.components = setupResult.components;
    this.systemCalls = setupResult.systemCalls;
  }

  preload() {
    // tiles texture
    // this.load.image("bush", "src/assets/tiles/Bush.png");
    // this.load.image("grass", "src/assets/tiles/Grass.png");
    this.load.image("plain", "src/assets/tiles/Grass.png");
    // this.load.image("rock", "src/assets/tiles/Rock.png");
    this.load.image("mountain", "src/assets/tiles/Rock.png");
    // this.load.image("tree", "src/assets/tiles/Tree.png");
    this.load.image("forest", "src/assets/tiles/Tree.png");
    this.load.image("ocean", "src/assets/tiles/Water.png");
    // this.load.image("stump", "src/assets/tiles/Stump.png");
    // this.load.image("fence", "src/assets/tiles/Fence.png");
    // this.load.image("node", "src/assets/tiles/Node.png");
    // this.load.image("foundry", "src/assets/tiles/Foundry.png");
    // this.load.image("safe", "src/assets/tiles/Safe.png");

    // player texture
    this.load.atlas(
      "host1",
      "src/assets/hosts/sprites/host1.png",
      "src/assets/hosts/sprites/host1.json"
    );
    this.hostTextures = [
      { key: "host-farmer1", url: "src/assets/hosts/sprites/farmer_1_1.png" },
      { key: "host-farmer2", url: "src/assets/hosts/sprites/farmer_1_2.png" },
      { key: "host-farmer3", url: "src/assets/hosts/sprites/farmer_1_3.png" },
      { key: "host-farmer4", url: "src/assets/hosts/sprites/farmer_1_4.png" },
      { key: "host-farmer5", url: "src/assets/hosts/sprites/farmer_1_5.png" },
    ];
    for (let i = 0; i < this.hostTextures.length; i++) {
      this.load.spritesheet(
        this.hostTextures[i].key,
        this.hostTextures[i].url,
        {
          frameWidth: this.hostTextures[i]?.frameWidth ?? 64,
          frameHeight: this.hostTextures[i]?.frameHeight ?? 64,
        }
      );
    }
    this.load.spritesheet("farmer", "src/assets/hosts/sprites/farmer_1_1.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    const {
      TerrainValue,
      TerrainValues,
      TargetTile,
      Path,
      Position,
      EntityType,
      StoredSize,
      Owner,
      Moves,
      SelectedHost,
      SelectedEntity,
      Commander,
      RoleDirection,
      ConsoleMessage,
    } = this.components;
    const world = this.network.world;
    const camera = this.cameras.main;
    this.createAnimations();

    // render map terrain
    defineSystem(world, [Has(TerrainValues)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        return this.unloadGrid(entity);
      }
      const value = getComponentValue(TerrainValues, entity)!.value;
      this.loadGrid(entity, value);
    });

    defineSystem(world, [Has(TargetTile)], ({ entity, type }) => {
      const prevTileId = this.selectedTiles[entity];
      this.tiles[prevTileId]?.unselect();
      if (type === UpdateType.Exit) {
        return delete this.selectedTiles[entity];
      }
      const currTileId = getComponentValue(TargetTile, entity)?.value;
      if (!currTileId) return;
      this.selectedTiles[entity] = currTileId;
      this.tiles[currTileId]?.select();
      const pathCoords = calculatePathCoords(this.components, entity);
    });

    // defineSystem(world, [Has(TerrainValue)], ({ entity, type }) => {
    //   const { x, y } = split(BigInt(entity));
    //   if (type === UpdateType.Exit) {
    //     return this.unloadTile(x, y);
    //   }
    //   const value = getComponentValue(TerrainValue, entity)!.value;
    //   this.loadTile(x, y, value);
    //   console.log("terrain", x, y, value);
    // });

    // defineSystem(world, [Has(RemovedCoord)], ({ entity }) => {
    //   removeComponent(TerrainValue, entity);
    //   setComponent(TerrainValue, entity, { value: TerrainType.Grass });
    // });

    // render roles ~ hosts
    defineSystem(world, [Has(Path), Has(Commander)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        this.hosts[entity]?.destroy();
        return delete this.hosts[entity];
      }
      this.hosts[entity]?.destroy();
      this.hosts[entity] = new Host(this, this.components, {
        entity,
        isPlayer:
          getComponentValue(Commander, entity)?.value ===
          this.network.playerEntity,
        onClick: () => this.sourceSelectHandler(entity),
      });
    });

    // // render buildings
    // defineSystem(world, [Has(Position), Not(Commander)], ({ entity, type }) => {
    //   if (type === UpdateType.Exit) {
    //     return this.unloadBuilding(entity);
    //   }
    //   this.buildings[entity]?.destroy();
    //   this.loadBuilding(entity);
    // });

    defineSystem(
      world,
      [HasValue(EntityType, { value: POOL }), Has(StoredSize)],
      ({ entity, type }) => {
        const role = getComponentValue(Owner, entity)?.value as Entity;
        if (!role) return;
        this.hosts[role]?.updatePoolBar();
      }
    );

    // render moves assuming they are all valid
    defineSystem(world, [Has(Moves)], ({ entity, type }) => {
      this.hosts[entity]?.movesUpdate();
    });

    defineSystem(world, [Has(RoleDirection)], ({ entity, type }) => {
      this.hosts[entity]?.directionUpdate();
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (!this.keyDownTime) {
        this.keyDownTime = Date.now();
      }
      const source = getComponentValue(SelectedHost, SOURCE)?.value;
      const menu = getComponentValue(SelectedEntity, MENU)?.value;
      if (event.key === "j") {
        if (menu || !source) return;
        setComponent(SelectedEntity, MENU, { value: EXPLORE_MENU });
      } else if (event.key === "Enter") {
        if (!source) {
          selectFirstHost(this.components, this.network.playerEntity);
        }
        removeComponent(ConsoleMessage, SOURCE);
        if (menu) return removeComponent(SelectedEntity, MENU);
        return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else if (event.key === "q") {
        selectNextHost(this.components, this.network.playerEntity);
      } else if (event.key === "k") {
        if (menu || !source) return;
        removeComponent(Moves, source);
        return removeComponent(ConsoleMessage, SOURCE);
      }
    });

    defineSystem(world, [Has(SelectedHost)], ({ entity, type }) => {
      const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
      if (!role) return;
      if (type === UpdateType.Exit) {
        return this.hosts[role]?.unfollow();
      }
      return this.hosts[role]?.follow();
    });

    this.input.keyboard?.on("keyup", (event: KeyboardEvent) => {
      let isTap = false;
      if (this.keyDownTime) {
        const duration = Date.now() - this.keyDownTime;
        if (duration < this.tapDuration) {
          isTap = true;
        }
        this.keyDownTime = null;
      }
      const source = getComponentValue(SelectedHost, SOURCE)?.value;
      // TODO: find better way to make exception?
      const menu = getComponentValue(SelectedEntity, MENU)?.value;
      if (event.key === "w") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.UP);
        setComponent(RoleDirection, source, { value: Direction.UP });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.UP);
      } else if (event.key === "s") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.DOWN);
        setComponent(RoleDirection, source, { value: Direction.DOWN });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.DOWN);
      } else if (event.key === "a") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.LEFT);
        setComponent(RoleDirection, source, { value: Direction.LEFT });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.LEFT);
      } else if (event.key === "d") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.RIGHT);
        setComponent(RoleDirection, source, { value: Direction.RIGHT });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.RIGHT);
      }
    });

    // panning
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.buttons) {
        camera.scrollX -=
          (pointer.position.x - pointer.prevPosition.x) / camera.zoom;
        camera.scrollY -=
          (pointer.position.y - pointer.prevPosition.y) / camera.zoom;
      }
    });

    // zooming
    let lastPointerPosition = { x: 0, y: 0, worldX: 0, worldY: 0 };
    this.input.on("wheel", (pointer: Phaser.Input.Pointer) => {
      if (
        Phaser.Math.Distance.BetweenPoints(pointer, lastPointerPosition) > 2
      ) {
        lastPointerPosition = {
          x: pointer.x,
          y: pointer.y,
          worldX: pointer.worldX,
          worldY: pointer.worldY,
        };
      }
      const deltaZoom = 1 + 0.05 * (pointer.deltaY < 0 ? 1 : -1);
      // console.log(camera.zoom, deltaZoom);
      // const newZoom = this.maxZoomLevel;
      const newZoom = Phaser.Math.Clamp(
        camera.zoom * deltaZoom,
        this.minZoomLevel,
        this.maxZoomLevel
      );
      const deltaScrollX =
        (lastPointerPosition.worldX - camera.scrollX) * (camera.zoom / newZoom);
      const deltaScrollY =
        (lastPointerPosition.worldY - camera.scrollY) * (camera.zoom / newZoom);
      camera.scrollX = lastPointerPosition.worldX - deltaScrollX;
      camera.scrollY = lastPointerPosition.worldY - deltaScrollY;
      camera.zoom = newZoom;
    });
  }

  loadBuilding(building: Entity) {
    const position = getComponentValue(this.components.Position, building);
    const buildingType = getComponentValue(
      this.components.EntityType,
      building
    )?.value;
    if (!position || !buildingType) return;
    const { x, y } = position;
    const mapX = x * this.tileSize + this.tileSize / 2;
    const mapY = y * this.tileSize + this.tileSize / 2;
    const buildingNumber = BUILDING_TYPES.indexOf(buildingType as Hex);
    const sprite = this.add
      .sprite(mapX, mapY, buildingMapping[buildingNumber])
      .setDepth(1)
      .setScale(0.5);
    this.buildings[building] = sprite;
  }

  unloadBuilding(building: Entity) {
    const sprite = this.buildings[building];
    sprite?.destroy();
    delete this.buildings[building];
  }

  loadGrid(gridId: Entity, terrainValues: bigint) {
    const gridCoord = splitFromEntity(gridId);
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const shift = i + j * GRID_SIZE;
        const tileCoord = {
          x: gridCoord.x * GRID_SIZE + i,
          y: gridCoord.y * GRID_SIZE + j,
        };
        const terrain = Number((terrainValues >> BigInt(shift * 4)) & 15n);
        this.loadTile(tileCoord.x, tileCoord.y, terrain);
      }
    }
  }

  unloadGrid(gridId: Entity) {
    const gridCoord = splitFromEntity(gridId);
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const tileCoord = {
          x: gridCoord.x * GRID_SIZE + i,
          y: gridCoord.y * GRID_SIZE + j,
        };
        this.unloadTile(tileCoord.x, tileCoord.y);
      }
    }
  }

  loadTile(x: number, y: number, terrain: number) {
    const entity = combine(x, y) as Entity;
    this.tiles[entity]?.destroy();
    this.tiles[entity] = new Tile(this, this.components, {
      entity,
      terrain,
      onClick: () => this.sourceSelectHandler(entity),
    });
    // handle 0 layer
    // if (terrain === TerrainType.Rock) {
    //   this.tilesLayer0[entity]?.destroy();
    //   const tile0 = this.add.sprite(tileX, tileY, "water").setDepth(-1);
    //   this.tilesLayer0[entity] = tile0;
    // } else if (terrain !== TerrainType.Water && terrain !== TerrainType.Grass) {
    //   this.tilesLayer0[entity]?.destroy();
    //   const tile0 = this.add.sprite(tileX, tileY, "grass").setDepth(-1);
    //   this.tilesLayer0[entity] = tile0;
    // }
  }

  unloadTile(x: number, y: number) {
    const entity = combine(x, y) as Entity;
    this.tiles[entity]?.destroy();
    delete this.tiles[entity];
    // this.tilesLayer0[entity]?.destroy();
    // delete this.tilesLayer0[entity];
  }

  update() {}

  createAnimations() {
    for (let i = 0; i < this.hostTextures.length; i++) {
      this.anims.create({
        key: this.hostTextures[i].key + "-idle-right",
        frames: this.anims.generateFrameNumbers(this.hostTextures[i].key, {
          start: 0,
          end: 5,
        }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: this.hostTextures[i].key + "-walk-right",
        frames: this.anims.generateFrameNumbers(this.hostTextures[i].key, {
          start: 6,
          end: 11,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.anims.create({
      key: "host1-walk-down",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 0,
        end: 2,
        suffix: ".png",
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "host1-idle-down",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 0,
        end: 0,
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
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "host1-idle-left",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 3,
        end: 3,
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
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "host1-idle-right",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 6,
        end: 6,
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
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "host1-idle-up",
      frames: this.anims.generateFrameNames("host1", {
        prefix: "0",
        start: 9,
        end: 9,
        suffix: ".png",
      }),
    });
  }

  sourceSelectHandler(entity: Entity) {
    const { SelectedHost } = this.components;
    if (getComponentValue(SelectedHost, SOURCE)?.value === entity) {
      removeComponent(SelectedHost, SOURCE);
    } else {
      setComponent(SelectedHost, SOURCE, {
        value: entity,
      });
    }
  }

  // targetSelectHandler(entity: Entity) {
  //   const { SelectedHost } = this.components;
  //   if (getComponentValue(SelectedHost, TARGET)?.value === entity) {
  //     removeComponent(SelectedHost, TARGET);
  //   } else {
  //     setComponent(SelectedHost, TARGET, {
  //       value: entity,
  //     });
  //   }
  // }
}

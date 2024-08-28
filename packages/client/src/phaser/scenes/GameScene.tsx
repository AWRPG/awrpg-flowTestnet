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
  getNewTargetTile,
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
  OBSERVER,
  TerrainType,
  buildingMapping,
  terrainMapping,
} from "../../constants";
import { Host } from "../objects/Host";
import { POOL } from "../../contract/constants";
import { Hex, toHex } from "viem";
import { selectFirstHost, selectNextHost } from "../../logics/entity";
import { GRID_SIZE } from "../../logics/terrain";
import { Tile } from "../objects/Tile";
import grass_0_png from "../../assets/tiles/terrains/grass_0.png";
import grass_2_png from "../../assets/tiles/terrains/grass_2.png";
import mud_1_png from "../../assets/tiles/terrains/mud_1.png";
import ocean_wall_0_png from "../../assets/tiles/terrains/ocean_wall_0.png";
import mountain_0_png from "../../assets/tiles/terrains/mountain_0.png";
import cliff_0_png from "../../assets/tiles/terrains/cliff_0.png";
import gravel_0_png from "../../assets/tiles/terrains/gravel_0.png";
import boundary_json from "../../assets/tiles/terrains/boundary.json";
import boundary_reverse_json from "../../assets/tiles/terrains/boundary_reverse.json";
import ocean_png from "../../assets/tiles/terrains/ocean.png";
import pine_12_png from "../../assets/tiles/props/trees/pine_12.png";
import { castToBytes32 } from "../../utils/encode";
import { TileHighlight } from "../objects/TileHighlight";

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  tileSize = 16;
  minZoomLevel = 1 / 2;
  maxZoomLevel = 4;

  tilesLayer0: Record<Entity, Phaser.GameObjects.Sprite> = {};
  tiles: Record<Entity, Tile> = {};
  // source entityId -> tileCoordId
  selectedTiles: Record<Entity, Entity> = {};
  tileHighlights: Record<Entity, TileHighlight> = {};
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

  keyboardFocus: string = "Scene"; // [TODO]

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
    this.load.image("plain", "src/assets/tiles/Grass.png");
    this.load.image("mountain", "src/assets/tiles/Rock.png");
    this.load.image("forest", "src/assets/tiles/Tree.png");
    // this.load.image("ocean", "src/assets/tiles/Water.png");
    this.load.atlas("grass_boundary", grass_0_png, boundary_json);
    this.load.atlas("grass_2", grass_2_png, boundary_reverse_json);
    this.load.atlas("mud_1", mud_1_png, boundary_reverse_json);
    this.load.atlas("ocean_boundary", ocean_wall_0_png, boundary_json);
    this.load.atlas("mountain_boundary", mountain_0_png, boundary_json);
    this.load.atlas("gravel_0", gravel_0_png, boundary_json);
    this.load.image("ocean", ocean_png);
    this.load.image("pine_12", pine_12_png);
    // this.load.image("stump", "src/assets/tiles/Stump.png");
    // this.load.image("fence", "src/assets/tiles/Fence.png");
    // this.load.image("node", "src/assets/tiles/Node.png");
    // this.load.image("foundry", "src/assets/tiles/Foundry.png");
    this.load.image("safe", "src/assets/tiles/Safe.png");

    // player texture
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

    // cursor
    this.load.spritesheet("ui-cursor", "src/assets/ui/cursor.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // ui
    this.load.spritesheet("ui-highlight", "src/assets/ui/highlight.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const {
      TileValue,
      TerrainValues,
      TargetTile,
      Path,
      TileEntity,
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

    // this.anims.create({
    //   key: "grass_0_2",
    //   frames: this.anims.generateFrameNames("grass_0", {
    //     start: 2,
    //     end: 2,
    //     prefix: "grass_0_",
    //   }),
    // frameRate: 12,
    // repeat: -1,
    // });

    // render map terrain
    // defineSystem(world, [Has(TerrainValues)], ({ entity, type }) => {
    //   if (type === UpdateType.Exit) {
    //     return this.unloadGrid(entity);
    //   }
    //   const value = getComponentValue(TerrainValues, entity)!.value;
    //   this.loadGrid(entity, value);
    // });
    defineSystem(world, [Has(TileValue)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        return this.unloadTile(entity);
      } else if (type === UpdateType.Enter) {
        const value = getComponentValue(TileValue, entity)!.value;
        this.loadTile(entity, value);
      }
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
      // const pathCoords = calculatePathCoords(this.components, entity);

      for (const [entityId, tileId] of Object.entries(this.selectedTiles)) {
        if (entityId !== entity) {
          this.tiles[tileId]?.silentSelect();
        }
      }
    });

    defineSystem(world, [Has(TileEntity)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        return console.log("removing tile");
      }
      const tileCoord = splitFromEntity(entity);
      const entityId = getComponentValue(TileEntity, entity)!.value;
      this.add
        .tileSprite(
          (tileCoord.x + 0.5) * this.tileSize,
          (tileCoord.y + 0.3) * this.tileSize,
          0,
          0,
          "safe"
        )
        .setScale(0.4)
        .setDepth(12);
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
      if (this.tileHighlights[entity]) {
        this.tileHighlights[entity].destroy();
        delete this.tileHighlights[entity];
      }
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

      if (event.key === "Enter") {
        const target: Entity = source || OBSERVER;
        const targetCoordId = getComponentValue(TargetTile, target)?.value;
        if (targetCoordId) {
          const entityId = getComponentValue(
            this.components.TileEntity,
            castToBytes32(BigInt(targetCoordId)) as Entity
          )?.value;
          if (entityId === source) {
            // Focus on the hosts can be controlled by this player

            if (this.tileHighlights[target]) {
              this.tileHighlights[target].destroy();
              delete this.tileHighlights[target];
            } else {
              this.tileHighlights[target] = new TileHighlight(
                target,
                this.components,
                this,
                {
                  canControl: true,
                }
              );
            }
          }
        }
      }

      if (event.key === "j") {
        if (menu || !source) return;
        setComponent(SelectedEntity, MENU, { value: EXPLORE_MENU });
      } else if (event.key === "Escape") {
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

      let isTap = false;
      if (this.keyDownTime) {
        const duration = Date.now() - this.keyDownTime;
        if (duration < this.tapDuration) {
          isTap = true;
        }
        this.keyDownTime = null;
      }

      if (event.key === "w") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.UP);
        // if (!isTap)
        // updateMoves(this.components, this.systemCalls, Direction.UP);
      } else if (event.key === "s") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.DOWN);
        // if (!isTap)
        // updateMoves(this.components, this.systemCalls, Direction.DOWN);
      } else if (event.key === "a") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.LEFT);
        // setComponent(RoleDirection, source, { value: Direction.LEFT });
        // if (!isTap)
        // updateMoves(this.components, this.systemCalls, Direction.LEFT);
      } else if (event.key === "d") {
        if (menu || !source) return;
        setNewTargetTile(this.components, source, Direction.RIGHT);
        // setComponent(RoleDirection, source, { value: Direction.RIGHT });
        // if (!isTap)
        // updateMoves(this.components, this.systemCalls, Direction.RIGHT);
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

  // loadGrid(gridId: Entity, terrainValues: bigint) {
  //   const gridCoord = splitFromEntity(gridId);
  //   for (let i = 0; i < GRID_SIZE; i++) {
  //     for (let j = 0; j < GRID_SIZE; j++) {
  //       const shift = i + j * GRID_SIZE;
  //       const tileCoord = {
  //         x: gridCoord.x * GRID_SIZE + i,
  //         y: gridCoord.y * GRID_SIZE + j,
  //       };
  //       const terrain = Number((terrainValues >> BigInt(shift * 4)) & 15n);
  //       this.loadTile(tileCoord.x, tileCoord.y, terrain);
  //     }
  //   }
  // }

  // unloadGrid(gridId: Entity) {
  //   const gridCoord = splitFromEntity(gridId);
  //   for (let i = 0; i < GRID_SIZE; i++) {
  //     for (let j = 0; j < GRID_SIZE; j++) {
  //       const tileCoord = {
  //         x: gridCoord.x * GRID_SIZE + i,
  //         y: gridCoord.y * GRID_SIZE + j,
  //       };
  //       this.unloadTile(tileCoord.x, tileCoord.y);
  //     }
  //   }
  // }

  loadTile(entity: Entity, tileValue: string[]) {
    this.tiles[entity]?.destroy();
    this.tiles[entity] = new Tile(this, this.components, {
      entity,
      tileValue,
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

  unloadTile(entity: Entity) {
    this.tiles[entity]?.destroy();
    delete this.tiles[entity];
    // this.tilesLayer0[entity]?.destroy();
    // delete this.tilesLayer0[entity];
  }

  update() {}

  createAnimations() {
    // host
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

    // cursor
    this.anims.create({
      key: "ui-cursor-active",
      frames: this.anims.generateFrameNumbers("ui-cursor", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    // ui-highlight
    this.anims.create({
      key: "ui-highlight-active",
      frames: [{ key: "ui-highlight", frame: 5 }],
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

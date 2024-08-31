import {
  Entity,
  Has,
  HasValue,
  Not,
  UpdateType,
  defineSystem,
  defineUpdateSystem,
  getComponentValue,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { setup, SetupResult } from "../../mud/setup";
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
  TerrainType,
  buildingMapping,
  terrainMapping,
} from "../../constants";
import { Host } from "../objects/Host";
import { POOL } from "../../contract/constants";
import { Hex, toHex } from "viem";
import {
  isBuilding,
  selectFirstHost,
  selectNextHost,
} from "../../logics/entity";
import { compileGridTerrainValues, GRID_SIZE } from "../../logics/terrain";
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
import { updateNeighborGrids } from "../../mud/setupTiles";
import { syncComputedComponents } from "../../mud/syncComputedComponents";
import { Building } from "../objects/Building";
import { Mine } from "../objects/Mine";

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
  // tileId -> Building class
  buildings: Record<Entity, Building> = {};
  // gridId -> Mine class
  mines: Record<Entity, Mine> = {};

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
    this.load.image("node", "src/assets/tiles/Node.png");
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
      MineValue,
      Terrain,
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

    /**
     * load/unload tile sprites on map; TileValue is a client component that is updated when character moves, which is handled by useSyncComputedComponents
     */
    defineSystem(world, [Has(TileValue)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        return this.unloadTile(entity);
      } else {
        // (type === UpdateType.Enter)
        const value = getComponentValue(TileValue, entity)!.value;
        this.loadTile(entity, value);
      }
    });

    /**
     * update curr grid's TerrainValues & tile values on curr & neighbor grids, which will recalc TileValue and trigger loadTile.
     * call it in phaser scene so as to only render worldView.contains
     */
    defineSystem(world, [Has(Terrain)], ({ entity }) => {
      const gridCoord = splitFromEntity(entity);
      const worldView = this.cameras.main.worldView;
      const position = {
        x: gridCoord.x * GRID_SIZE * this.tileSize,
        y: gridCoord.y * GRID_SIZE * this.tileSize,
      };
      if (!worldView.contains(position.x, position.y)) return;
      // const prevValues = getComponentValue(TerrainValues, entity)?.value;
      const terrainValues = compileGridTerrainValues(
        this.components,
        this.systemCalls,
        entity
      );
      setComponent(TerrainValues, entity, { value: terrainValues });
      updateNeighborGrids(this.components, entity);
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

    /**
     * rn, load/unload building because role is handled by Path
     * note: entity is tileId
     */
    defineSystem(world, [Has(TileEntity)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        return this.unloadTileEntity(entity);
      }
      this.loadTileEntity(entity);
    });

    defineSystem(world, [Has(MineValue)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        this.mines[entity]?.destroy();
        return delete this.mines[entity];
      }
      console.log("mine", entity);
      this.mines[entity]?.destroy();
      this.mines[entity] = new Mine(this, this.components, {
        entity,
        onClick: () => this.sourceSelectHandler(entity),
      });
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

    // render roles ~ hosts
    // TODO: add loadRole & unloadRole to handle role's enter & exit; therefore, when tile is loaded/unloaded, call loadRole/unloadRole on it
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

    defineSystem(
      world,
      [HasValue(EntityType, { value: POOL }), Has(StoredSize)],
      ({ entity, type }) => {
        const role = getComponentValue(Owner, entity)?.value as Entity;
        if (!role) return;
        this.hosts[role]?.updatePoolBar();
      }
    );

    // // render moves assuming they are all valid
    // defineSystem(world, [Has(Moves)], ({ entity, type }) => {
    //   this.hosts[entity]?.movesUpdate();
    // });

    // defineSystem(world, [Has(RoleDirection)], ({ entity, type }) => {
    //   this.hosts[entity]?.directionUpdate();
    // });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (!this.keyDownTime) {
        this.keyDownTime = Date.now();
      }
      const source = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
      const menu = getComponentValue(SelectedEntity, MENU)?.value;

      if (event.key === "Enter") {
        if (!menu)
          return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
        if (!source) return;
        const targetCoordId = getComponentValue(TargetTile, source)?.value;
        if (!targetCoordId) return;
        const entity = getComponentValue(TileEntity, targetCoordId)?.value;
        if (entity === source) {
          // Focus on the hosts can be controlled by this player

          if (this.tileHighlights[source]) {
            this.tileHighlights[source].destroy();
            delete this.tileHighlights[source];
          } else {
            this.tileHighlights[source] = new TileHighlight(
              source,
              this.components,
              this,
              {
                canControl: true,
              }
            );
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
        console.log("w", menu, source);
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

  // rn, used to render building because role is handled by Path
  loadTileEntity(tileId: Entity) {
    const building = getComponentValue(this.components.TileEntity, tileId)
      ?.value as Entity;
    if (!isBuilding(this.components, building)) return;
    this.loadBuilding(tileId, building);
  }

  unloadTileEntity(tileId: Entity) {
    this.unloadBuilding(tileId);
  }

  loadBuilding(tileId: Entity, building: Entity) {
    this.buildings[tileId]?.destroy();
    this.buildings[tileId] = new Building(this, this.components, {
      tileId,
      entity: building,
      onClick: () => this.sourceSelectHandler(building),
    });
  }

  unloadBuilding(tileId: Entity) {
    this.buildings[tileId]?.destroy();
    delete this.buildings[tileId];
  }

  loadTile(entity: Entity, tileValue: string[]) {
    this.tiles[entity]?.destroy();
    // console.log("loadTile", entity, tileValue);
    this.tiles[entity] = new Tile(this, this.components, {
      entity,
      tileValue,
      onClick: () => this.sourceSelectHandler(entity),
    });
    this.loadTileEntity(entity);
  }

  unloadTile(entity: Entity) {
    this.tiles[entity]?.destroy();
    delete this.tiles[entity];
    this.unloadTileEntity(entity);
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

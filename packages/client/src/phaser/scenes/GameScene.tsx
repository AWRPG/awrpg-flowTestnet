import {
  Entity,
  Has,
  HasValue,
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
  combine,
  movesToPositions,
  split,
  updateMoves,
} from "../../logics/move";
import {
  EXPLORE_MENU,
  MAIN_MENU,
  MENU,
  SOURCE,
  TerrainType,
  terrainMapping,
} from "../../constants";
import { Role } from "../objects/Role";
import { POOL } from "../../contract/constants";

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  tileSize = 32;
  minZoomLevel = 1 / 2 ** 2;
  maxZoomLevel = 1.5;

  tilesLayer0: Record<Entity, Phaser.GameObjects.Sprite> = {};
  tiles: Record<Entity, Phaser.GameObjects.Sprite> = {};

  hosts: Record<Entity, Role> = {};

  tapDuration = 60;
  keyDownTime: number | null = null;

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
    const {
      TerrainValue,
      RemovedCoord,
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
    defineSystem(world, [Has(TerrainValue)], ({ entity, type }) => {
      const { x, y } = split(BigInt(entity));
      if (type === UpdateType.Exit) {
        return this.unloadTile(x, y);
      }
      const value = getComponentValue(TerrainValue, entity)!.value;
      this.loadTile(x, y, value);
      // console.log(value);
    });

    defineSystem(world, [Has(RemovedCoord)], ({ entity }) => {
      removeComponent(TerrainValue, entity);
      setComponent(TerrainValue, entity, { value: TerrainType.Grass });
    });

    // render hosts (or entities have position)
    defineSystem(world, [Has(Position)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        this.hosts[entity]?.destroy();
        return delete this.hosts[entity];
      }
      this.hosts[entity]?.destroy();
      this.hosts[entity] = new Role(this, this.components, this.tileSize, {
        entity,
        isPlayer:
          getComponentValue(Commander, entity)?.value ===
          this.network.playerEntity,
        onClick: () => this.sourceSelectHandler(entity),
        onPointerOver: () => {},
        onPointerOut: () => {},
      });
      // this.hosts[entity].setInteractive();
      // this.hosts[entity].on("pointerdown", () =>
      //   this.sourceSelectHandler(entity)
      // );
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
          const hosts = [
            ...runQuery([
              HasValue(Commander, { value: this.network.playerEntity }),
            ]),
          ];
          setComponent(SelectedHost, SOURCE, { value: hosts[0] });
        }
        removeComponent(ConsoleMessage, SOURCE);
        if (menu) return removeComponent(SelectedEntity, MENU);
        return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
      } else if (event.key === "q") {
        const hosts = [
          ...runQuery([
            HasValue(Commander, { value: this.network.playerEntity }),
          ]),
        ];
        const index = source ? hosts.indexOf(source) : -1;
        const nextIndex = (index + 1) % hosts.length;
        setComponent(SelectedHost, SOURCE, { value: hosts[nextIndex] });
      } else if (event.key === "k") {
        // if (menu || !source) return;
        // return removeComponent(Moves, source);
        return removeComponent(ConsoleMessage, SOURCE);
      }
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
        setComponent(RoleDirection, source, { value: Direction.UP });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.UP);
      } else if (event.key === "s") {
        if (menu || !source) return;
        setComponent(RoleDirection, source, { value: Direction.DOWN });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.DOWN);
      } else if (event.key === "a") {
        if (menu || !source) return;
        setComponent(RoleDirection, source, { value: Direction.LEFT });
        if (!isTap)
          updateMoves(this.components, this.systemCalls, Direction.LEFT);
      } else if (event.key === "d") {
        if (menu || !source) return;
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

  loadTile(x: number, y: number, terrain: number) {
    const tileX = x * this.tileSize + this.tileSize / 2;
    const tileY = y * this.tileSize + this.tileSize / 2;
    const tile = this.add.sprite(tileX, tileY, terrainMapping[terrain]);
    const entity = combine(x, y) as Entity;
    this.tiles[entity] = tile;
    tile.setInteractive();
    tile.on("pointerdown", () => console.log("tile", x, y, terrain));
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

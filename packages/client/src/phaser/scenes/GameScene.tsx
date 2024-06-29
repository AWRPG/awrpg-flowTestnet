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

export class GameScene extends Phaser.Scene {
  network: SetupResult["network"];
  components: SetupResult["components"];
  systemCalls: SetupResult["systemCalls"];

  tileSize = 32;
  minZoomLevel = 1 / 2 ** 2;
  maxZoomLevel = 1;

  tilesLayer0: Record<Entity, Phaser.GameObjects.Sprite> = {};
  tiles: Record<Entity, Phaser.GameObjects.Sprite> = {};

  hosts: Record<Entity, Phaser.GameObjects.Sprite> = {};
  hostMoveTo?: Phaser.GameObjects.Sprite;
  moves?: Phaser.GameObjects.Group;

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
    const {
      TerrainValue,
      Position,
      Moves,
      SelectedHost,
      SelectedEntity,
      Commander,
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

    // render hosts (or entities have position)
    defineSystem(world, [Has(Position)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        this.hosts[entity]?.destroy();
        return delete this.hosts[entity];
      }
      const position = getComponentValue(Position, entity)!;
      const { x, y } = position;
      this.hosts[entity]?.destroy();
      this.hosts[entity] = this.add
        .sprite(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          "host1"
        )
        .setDepth(2);
      // host.play("host1-walk-down");
      this.hosts[entity].setInteractive();
      this.hosts[entity].on("pointerdown", () =>
        this.sourceSelectHandler(entity)
      );
    });

    // render moves assuming they are all valid
    defineSystem(world, [Has(Moves)], ({ entity, type }) => {
      if (type === UpdateType.Exit) {
        this.moves?.clear(true, true);
        return this.hostMoveTo?.destroy();
      }
      if (entity !== SOURCE) return;
      const moves = getComponentValue(Moves, entity)!.value;
      if (moves.length === 0) return;
      const source = getComponentValue(SelectedHost, SOURCE)?.value;
      if (!source) return;
      const from = getComponentValue(Position, source)!;
      const positions = movesToPositions(moves, from);
      // console.log(positions);
      if (positions.length <= 1) return this.hostMoveTo?.destroy();
      // hostObj
      const { x, y } = positions[positions.length - 1];
      this.hostMoveTo?.destroy();
      this.hostMoveTo = this.add
        .sprite(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          "host1"
        )
        .setDepth(5);
      // movesTo
      this.moves?.clear(true, true);
      this.moves = this.add.group();
      // for each move of moves, add a line into the moves group
      for (let i = 0; i < positions.length - 1; i++) {
        const { x: x1, y: y1 } = positions[i];
        const { x: x2, y: y2 } = positions[i + 1];
        const line = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000).setDepth(10);
        line.setPosition(
          x1 * this.tileSize + this.tileSize / 2,
          y1 * this.tileSize + this.tileSize / 2
        );
        line.geom.x2 = x2 * this.tileSize - x1 * this.tileSize;
        line.geom.y2 = y2 * this.tileSize - y1 * this.tileSize;
        this.moves.add(line);
      }
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      // TODO: find better way to make exception?
      const menu = getComponentValue(SelectedEntity, MENU)?.value;
      if (event.key === "w") {
        if (menu) return;
        updateMoves(this.components, this.systemCalls, Direction.UP);
      } else if (event.key === "s") {
        if (menu) return;
        updateMoves(this.components, this.systemCalls, Direction.DOWN);
      } else if (event.key === "a") {
        if (menu) return;
        updateMoves(this.components, this.systemCalls, Direction.LEFT);
      } else if (event.key === "d") {
        if (menu) return;
        updateMoves(this.components, this.systemCalls, Direction.RIGHT);
      } else if (event.key === "Enter") {
        const hosts = [
          ...runQuery([
            HasValue(Commander, { value: this.network.playerEntity }),
          ]),
        ];
        if (hosts.length > 0) {
          setComponent(SelectedHost, SOURCE, { value: hosts[0] });
        }
        if (menu) return removeComponent(SelectedEntity, MENU);
        return setComponent(SelectedEntity, MENU, { value: MAIN_MENU });
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

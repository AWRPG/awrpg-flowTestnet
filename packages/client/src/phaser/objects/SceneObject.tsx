import { ClientComponents } from "../../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { Direction } from "../../logics/move";

/**
 * The object perpare to scene
 */
export class SceneObject {
  /**
   * [MUD] components
   */
  entity: Entity;

  /**
   * [MUD] components
   */
  components: ClientComponents;

  /**
   * which scene is this object in
   */
  scene: GameScene;

  /**
   * unique number in the scene [TODO]
   */
  index: number = 0;

  /**
   * tile size of the scene
   */
  tileSize: number;

  /**
   * position X by tile
   */
  tileX: number;

  /**
   * position Y by tile
   */
  tileY: number;

  /**
   * position x by pixel
   */
  x: number = 0;

  /**
   * position y by pixel
   */
  y: number = 0;

  /**
   * width by tile
   */
  tileWidth: number = 1;

  /**
   * height by tile
   */
  tileHeight: number = 1;

  /**
   * capable of being moved
   */
  movable: boolean = false;

  /**
   * the root object to the display
   */
  root: Phaser.GameObjects.Container;

  /**
   * @param entity the scene object's entity
   * @param components the world's components
   * @param scene the scene belong
   */
  constructor(entity: Entity, components: ClientComponents, scene: GameScene) {
    this.entity = entity;
    this.components = components;
    this.scene = scene;
    this.tileSize = scene.tileSize;

    // TDOO: different obj has different position calc
    const path = getComponentValue(components.Path, entity) ?? {
      x: 0,
      y: 0,
    };
    this.tileX = path.toTileX;
    this.tileY = path.toTileY;

    this.root = this.scene.add
      .container(
        (this.tileX + 0.5) * this.tileSize,
        (this.tileY + 0.5) * this.tileSize
      )
      .setDepth(2);
  }

  follow() {
    this.scene.cameras.main.startFollow(this.root, true);
  }

  unfollow() {
    this.scene.cameras.main.startFollow(this.root, false);
  }
}

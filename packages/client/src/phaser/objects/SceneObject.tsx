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
  tileX: number = 0;

  /**
   * position Y by tile
   */
  tileY: number = 0;

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
    this.root = this.scene.add.container(0, 0);
  }

  follow() {
    this.scene.cameras.main.startFollow(this.root, true);
  }

  unfollow() {
    this.scene.cameras.main.startFollow(this.root, false);
  }

  setTilePosition(x: number, y: number) {
    this.tileX = x;
    this.tileY = y;
    console.log(this.tileX, this.tileY);
    this.root.setPosition(
      (this.tileX + 0.5) * this.tileSize,
      (this.tileY + 0.5) * this.tileSize
    );
    console.log(this.tileSize, this.root.position);
  }
}

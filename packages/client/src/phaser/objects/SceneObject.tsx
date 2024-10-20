import { ClientComponents } from "../../mud/createClientComponents";
import { Entity, getComponentValue, setComponent } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { combineToEntity, Direction } from "../../logics/move";
import { getHostPosition } from "../../logics/path";
import { TARGET } from "../../constants";
import { SystemCalls } from "../../mud/createSystemCalls";

/**
 * The object perpare to scene
 */
export class SceneObject {
  /**
   * [MUD] entity
   */
  entity: Entity;

  /**
   * [MUD] components
   */
  components: ClientComponents;

  /**
   * [MUD] systemCalls
   */
  systemCalls: SystemCalls;

  /**
   * Which scene is this object in
   */
  scene: GameScene;

  /**
   * Tile size of the scene
   */
  tileSize: number;

  /**
   * Width by tile
   */
  tileWidth: number = 1;

  /**
   * Height by tile
   */
  tileHeight: number = 1;

  /**
   * Capable of being moved
   */
  movable: boolean = false;

  /**
   * Whether other objects can pass through this object
   */
  passable: boolean = true;

  /**
   * A empty gameObject as the root node
   */
  root: Phaser.GameObjects.Container;

  /**
   * Other scene objects can be added to the root of this object
   */
  accessories: Record<Entity, Phaser.GameObjects.Container> = {};

  /**
   * The tween of move to effect
   */
  moveTween: Phaser.Tweens.Tween | Phaser.Tweens.TweenChain | undefined;

  /** Mouse over */
  hovering: boolean = false;

  onConfirm?: () => void;

  onCancel?: () => void;

  /**
   * @param scene the scene belong
   * @param entity the scene object's entity
   */
  constructor(scene: GameScene, entity: Entity) {
    this.scene = scene;
    this.entity = entity;
    this.components = scene.components;
    this.systemCalls = scene.systemCalls;
    this.tileSize = scene.tileSize;
    this.root = scene.add.container(0, 0);
  }

  /**
   * Move to the target coord with tween
   * @param toX target x coord
   * @param toY target y coord
   */
  moveTo(
    toX: number,
    toY: number,
    duration: number = 90,
    onComplete?: () => void
  ) {
    if (this.moveTween) this.moveTween.destroy();
    this.moveTween = this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: duration,
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  follow() {
    this.scene.cameras.main.startFollow(this.root, true);
  }

  unfollow() {
    this.scene.cameras.main.startFollow(this.root, false);
  }

  setTileCoords(x: number, y: number) {
    this.tileX = x;
    this.tileY = y;
  }

  setDepth(depth: number) {
    this.root.setDepth(depth);
  }

  onFocus() {}
  onBlur() {}
  onUpPressed() {}
  onDownPressed() {}
  onLeftPressed() {}
  onRightPressed() {}

  onConfirmPressed() {
    if (this.onConfirm) this.onConfirm();
  }

  onCancelPressed() {
    if (this.onCancel) this.onCancel();
  }

  onSelected() {}
  onUnSelected() {}
  onHover() {
    this.hovering = true;
  }
  onUnHover() {
    this.hovering = false;
  }

  /**
   *
   * @param entity
   * @param type
   */
  setAccessory(entity: Entity, type: string) {
    if (this.accessories[entity]) {
      this.root.remove(this.accessories[entity], true);
    }
    let sceneObj;
    if (type === "role") {
      sceneObj = this.scene.hosts[entity];
      sceneObj.doWalkAnimation();
    } else if (type === "building") sceneObj = this.scene.buildings[entity];
    else return;
    const forkObjRoot = Phaser.Utils.Objects.Clone(
      sceneObj.root
    ) as Phaser.GameObjects.Container;
    this.accessories[entity] = forkObjRoot.setPosition(0, 0).setAlpha(1);
    this.root.add(this.accessories[entity]);
  }

  clearAccessory(entity: Entity) {
    if (this.accessories[entity]) {
      this.root.remove(this.accessories[entity]);
    }
    this.scene.hosts[entity].root.setAlpha(1);
    const coord = getHostPosition(this.components, this.scene.network, entity);
    if (!coord) return;
    // setComponent(this.components.TargetTile, TARGET, {
    //   value: combineToEntity(coord.x, coord.y),
    // });
  }

  get x() {
    return this.root.x;
  }

  set x(value: number) {
    this.root.x = value;
  }

  get y() {
    return this.root.y;
  }

  set y(value: number) {
    this.root.y = value;
  }

  get tileX() {
    return this.x / this.tileSize - 0.5;
  }

  set tileX(value: number) {
    this.x = (value + 0.5) * this.tileSize;
  }

  get tileY() {
    return this.y / this.tileSize - 0.5;
  }

  set tileY(value: number) {
    this.y = (value + 0.5) * this.tileSize;
  }
}

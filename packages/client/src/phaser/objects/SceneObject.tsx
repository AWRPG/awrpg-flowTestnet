import { ClientComponents } from "../../mud/createClientComponents";
import { Entity, getComponentValue, setComponent } from "@latticexyz/recs";
import { GameScene } from "../scenes/GameScene";
import { combineToEntity, Direction } from "../../logics/move";
import { getHostPosition } from "../../logics/path";
import { TARGET } from "../../constants";

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
   * Other scene objects can be added to the root of this object
   */
  accessories: Record<Entity, Phaser.GameObjects.Container> = {};

  /**
   * the tween of move to effect
   */
  moveTween: Phaser.Tweens.Tween | Phaser.Tweens.TweenChain | undefined;

  /** Mouse over */
  hovering: boolean = false;

  onConfirm?: () => void;

  onCancel?: () => void;

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

  /**
   * Tween effect to target coordinates
   * @param toX
   * @param toY
   */
  moveAnimation(
    toX: number,
    toY: number,
    duration: number = 75,
    onComplete?: () => void
  ) {
    if (this.moveTween) {
      this.moveTween.destroy();
      this.x = this.root.x;
      this.y = this.root.y;
      this.moveTween = undefined;
    }
    this.moveTween = this.scene.tweens.add({
      targets: this.root,
      x: toX,
      y: toY,
      duration: duration,
      onComplete: () => {
        this.x = toX;
        this.y = toY;
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

  setTilePosition(x: number, y: number) {
    this.tileX = x;
    this.tileY = y;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;
    this.root.setPosition(this.x, this.y);
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
}

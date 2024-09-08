import { ClientComponents } from "../../mud/createClientComponents";
import { Direction, movesToPositions } from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";
import { Hex, hexToString } from "viem";
import { getPool } from "../../contract/hashes";
import { getPoolAmount, getPoolCapacity } from "../../logics/pool";
import { POOL_COLORS, POOL_TYPES, SOURCE } from "../../constants";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { fromEntity } from "../../utils/encode";
import { UIScene } from "../scenes/UIScene";

/**
 * About the scene object with avatar such as character or building
 */
export class Host extends SceneObject {
  /**
   * is the main character of player
   */
  isPlayer: boolean;

  /**
   * The display object for host
   */
  avatar: Phaser.GameObjects.Sprite;

  /**
   * The shadow under the host [TODO]
   */
  shadow: Phaser.GameObjects.Shape | undefined = undefined;

  /**
   * the value of properties such as HP
   */
  properties: Map<string, number>;

  /**
   * tilesToMove
   */
  tilesToMove: { x: number; y: number }[] = [];

  /**
   * the side face to
   */
  direction: Direction;

  /**
   * @param scene the scene belong
   * @param components the world's components
   * @param params others
   */
  constructor(
    scene: GameScene,
    components: ClientComponents,
    {
      entity,
      isPlayer,
      onClick,
    }: {
      entity: Entity;
      isPlayer: boolean;
      onClick: () => void;
    }
  ) {
    super(entity, components, scene);
    this.isPlayer = isPlayer;
    this.properties = new Map();

    // TODO: different obj has different position calc
    const path = getComponentValue(components.Path, entity) ?? {
      toX: 0,
      toY: 0,
    };
    this.tileX = path.toX;
    this.tileY = path.toY;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;

    this.root.setPosition(this.x, this.y).setDepth(13);
    // draw avatar & set animation
    this.direction =
      getComponentValue(components.RoleDirection, entity)?.value ??
      Direction.DOWN;
    this.avatar = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      "host-farmer1"
    ).setOrigin(0.46, 0.7);
    this.root.add(this.avatar);
    this.doIdleAnimation();

    // add the bars of properties on the host
    // POOL_TYPES.forEach((type, index) => {
    //   this.properties[type] = this.makePoolBar(type, index);
    // });
    // const uiScene = this.scene.scene.get("UIScene") as UIScene;
    // this.root.on("changedata", uiScene.onDataChanged, uiScene);
    this.updateProperties();

    // // let camera follow the selected role
    // const role = getComponentValue(components.SelectedHost, SOURCE)?.value;
    // if (role) this.follow();
  }

  /**
   * Handles a series of movement animations with direction changes for
   * the Host object until the movement is confirmed by the chain.
   * @param moves A series of arrays representing directions
   */
  movesAnimation(moves: number[]) {
    this.doWalkAnimation();
    this.root.setAlpha(1);
    const tweenConfig: unknown[] = [];
    moves.forEach((move: number) => {
      switch (move) {
        case Direction.UP:
          this.y -= this.tileSize;
          break;
        case Direction.DOWN:
          this.y += this.tileSize;
          break;
        case Direction.LEFT:
          this.x -= this.tileSize;
          break;
        case Direction.RIGHT:
          this.x += this.tileSize;
          break;
      }
      tweenConfig.push({
        x: this.x,
        y: this.y,
        duration: 75,
      });
    });
    this.moveTween = this.scene.tweens.chain({
      targets: this.root,
      tweens: tweenConfig,
      onComplete: () => {
        this.doIdleAnimation();
      },
    });
  }

  moveAnimation(toX: number, toY: number) {
    this.doWalkAnimation();
    const distance = Math.min(
      (Math.abs(this.x - toX) + Math.abs(this.y - toY)) / this.tileSize,
      10
    );
    console.log(distance);
    super.moveAnimation(toX, toY, distance * 75, () => {
      this.doIdleAnimation();
    });
  }

  // triggered whenever Moves component is updated
  movesUpdate(moves: number[]) {}

  directionUpdate() {
    this.doIdleAnimation();
  }

  doWalkAnimation() {
    this.direction =
      getComponentValue(this.components.RoleDirection, this.entity)?.value ??
      Direction.DOWN;
    if (this.direction === Direction.LEFT) this.avatar.flipX = true;
    if (this.direction === Direction.RIGHT) this.avatar.flipX = false;
    return this.avatar.play("host-farmer1-walk-right");
  }

  doIdleAnimation() {
    this.direction =
      getComponentValue(this.components.RoleDirection, this.entity)?.value ??
      Direction.DOWN;
    if (this.direction === Direction.LEFT) this.avatar.flipX = true;
    if (this.direction === Direction.RIGHT) this.avatar.flipX = false;
    return this.avatar.play("host-farmer1-idle-right");
  }

  destroy() {
    this.moveTween?.destroy();
    this.avatar.destroy();
  }

  setPropertyValue(type: Hex, entityId: number) {
    const amount = getPoolAmount(this.components, this.entity as Hex, type);
    const capacity = getPoolCapacity(this.components, this.entity as Hex, type);
    const typeName = hexToString(type, { size: 32 });
    this.properties.set(typeName, Number(amount));
    this.properties.set("max" + typeName, Number(capacity));
  }

  /**
   * update the properties
   */
  updateProperties() {
    const entityId = Number(fromEntity(this.entity as Hex).id);
    POOL_TYPES.forEach((type, index) => {
      this.setPropertyValue(type, entityId);
    });
  }
}

import { ClientComponents } from "../../mud/createClientComponents";
import {
  calculatePathMoves,
  Direction,
  movesToPositions,
} from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";
import { Hex, hexToString, toHex } from "viem";
import { getPool } from "../../contract/hashes";
import { getPoolAmount, getPoolCapacity } from "../../logics/pool";
import { POOL_COLORS, POOL_TYPES, SOURCE } from "../../constants";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { fromEntity } from "../../utils/encode";
import { UIScene } from "../scenes/UIScene";
import { Vector } from "../../utils/vector";
import { UIController } from "../components/controllers/UIController";
import { SceneObjectController } from "../components/controllers/SceneObjectController";
import { BuildingData, BuildingSpecs } from "../../api/data";
import {
  canBuildFromHost,
  getBuildableCoordsInfo,
} from "../../logics/building";

/**
 * About the scene object with avatar such as character or building
 */
export class Host extends SceneObject {
  /**
   * is the main character of player
   */
  isPlayer: boolean;

  /**
   * Is moving on client
   */
  isMoving: boolean;

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

  prevCoord?: Vector;

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
    this.isMoving = false;
    this.properties = new Map();

    // TODO: different obj has different position calc
    const path = getComponentValue(components.Path, entity) ?? {
      toX: 0,
      toY: 0,
    };
    this.tileX = path.toX;
    this.tileY = path.toY;

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

  onFocus() {
    super.onFocus();
    UIController.scene.characterInfo?.show(this);
  }

  onBlur() {
    super.onBlur();
    UIController.scene.characterInfo?.hidden();
  }

  onUpPressed() {
    super.onUpPressed();
    SceneObjectController.moveCursor(Direction.UP);
  }
  onDownPressed() {
    super.onDownPressed();
    SceneObjectController.moveCursor(Direction.DOWN);
  }
  onLeftPressed() {
    super.onLeftPressed();
    SceneObjectController.moveCursor(Direction.LEFT);
  }
  onRightPressed() {
    super.onRightPressed();
    SceneObjectController.moveCursor(Direction.RIGHT);
  }

  onConfirmPressed() {
    super.onConfirmPressed();
    const uiscene = UIController.scene;

    if (uiscene.moveTips?.isVisible) {
      if (this.movesUpdate()) {
        uiscene.moveTips.hidden();
        SceneObjectController.resetFocus();
      }
    } else if (uiscene.constructTips?.isVisible) {
      if (
        this.construct(
          uiscene.constructTips.buildingType!,
          uiscene.constructTips.buildingSpecs!
        )
      ) {
        uiscene.constructTips.hidden();
        SceneObjectController.resetFocus();
      }
    }
  }

  onCancelPressed() {
    super.onCancelPressed();
    if (UIController.scene.moveTips?.isVisible) {
      UIController.scene.moveTips.hidden();
      UIController.scene.actionMenu?.show(this);
    } else if (UIController.scene.constructTips?.isVisible) {
      UIController.scene.constructTips.hidden();
      UIController.scene.constructMenu?.show(this);
    }
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
        this.avatar.setTint(0x808080);
      },
    });
  }

  // triggered whenever Moves component is updated
  movesUpdate(): boolean {
    const moves = calculatePathMoves(this.components, this.entity);
    if (!moves || moves.length === 0 || moves.length > 20) return false;
    this.scene.systemCalls.move(this.entity as Hex, moves as number[]);
    this.isMoving = true;
    this.movesAnimation(moves);
    return true;
  }

  /**
   * Construct a building
   * If action success return true, else return false
   */
  construct(buildingType: Hex, buildingSpecs: BuildingSpecs): boolean {
    const cursor = this.scene.cursor;
    if (!cursor) return false;
    const lowerCoord = { x: cursor.tileX, y: cursor.tileY };
    const adjacentCoord = canBuildFromHost(
      this.components,
      this.systemCalls,
      this.entity,
      lowerCoord,
      buildingType
    );
    if (!adjacentCoord) return false;
    this.systemCalls.buildBuilding(
      this.entity as Hex,
      buildingType,
      adjacentCoord,
      lowerCoord
    );
    return false;
  }

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
    this.scene.tileHighlights[this.entity]?.hide();
    delete this.scene.tileHighlights[this.entity];
    this.moveTween?.destroy();
    this.avatar.destroy();
  }

  setPropertyValue(type: Hex, entityId: number) {
    const amount = getPoolAmount(this.components, this.entity, type);
    const capacity = getPoolCapacity(this.components, this.entity, type);
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

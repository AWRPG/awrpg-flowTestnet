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
  properties: Hex[] = [];

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

    // TODO: different obj has different position calc
    const path = getComponentValue(components.Path, entity) ?? {
      toX: 0,
      toY: 0,
    };
    this.tileX = path.toX;
    this.tileY = path.toY;

    this.root
      .setPosition(
        (this.tileX + 0.5) * this.tileSize,
        (this.tileY + 0.5) * this.tileSize
      )
      .setDepth(13);
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

  // triggered whenever Moves component is updated
  movesUpdate() {
    const moves =
      getComponentValue(this.components.Moves, this.entity)?.value ?? [];
    this.tilesToMove = movesToPositions(moves, {
      x: this.tileX,
      y: this.tileY,
    });
    const to = this.tilesToMove[this.tilesToMove.length - 1];

    // this.scene.tweens.add({
    //   targets: this.root,
    //   x: (to.x + 0.5) * this.tileSize,
    //   y: (to.y + 0.5) * this.tileSize,
    //   duration: 200,
    //   repeat: 0,
    // });

    // this.doWalkAnimation();
    // update movesObj
    // this.movesObj?.clear(true, true);
    // this.movesObj = this.scene.add.group();
    // // for each move of moves, add a line into the moves group
    // for (let i = 0; i < this.positions.length - 1; i++) {
    //   const { x: x1, y: y1 } = this.positions[i];
    //   const { x: x2, y: y2 } = this.positions[i + 1];
    //   const line = this.scene.add.line(0, 0, 0, 0, 0, 0, 0xff0000).setDepth(10);
    //   line.setLineWidth(3);
    //   line.setPosition(
    //     x1 * this.tileSize + this.avatar.displayOriginX,
    //     y1 * this.tileSize + this.avatar.displayOriginY
    //   );
    // console.log(this.avatar.x, this.avatar.y);
    // console.log(this.avatar.displayOriginX, this.avatar.displayOriginY);
    //   line.geom.x2 = x2 * this.tileSize - x1 * this.tileSize;
    //   line.geom.y2 = y2 * this.tileSize - y1 * this.tileSize;
    //   this.movesObj.add(line);
    // }
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
    this.avatar.destroy();
    // this.movesObj?.clear(true, true);
  }

  setPropertyValue(type: Hex, entityId: number) {
    const amount = getPoolAmount(this.components, this.entity as Hex, type);
    const capacity = getPoolCapacity(this.components, this.entity as Hex, type);
    this.root.setData(hexToString(type, { size: 32 }), Number(amount) / 3);
    this.root.setData(
      "max" + hexToString(type, { size: 32 }),
      Number(capacity)
    );
    // console.log(
    //   entityId +
    //     " " +
    //     hexToString(type, { size: 32 }) +
    //     ": " +
    //     amount +
    //     " / " +
    //     capacity
    // );
  }

  /**
   * update the properties
   */
  updateProperties() {
    const entityId = Number(fromEntity(this.entity as Hex).id);
    // if (this.isPlayer === true)
    POOL_TYPES.forEach((type, index) => {
      this.setPropertyValue(type, entityId);
    });
  }
}

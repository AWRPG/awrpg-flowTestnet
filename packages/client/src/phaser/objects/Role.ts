import { ClientComponents } from "../../mud/createClientComponents";
import { Direction, movesToPositions } from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";

export class Role {
  scene: Phaser.Scene;
  components: ClientComponents;

  tileSize: number;

  entity: Entity;
  x: number;
  y: number;
  positions: { x: number; y: number }[];
  direction: Direction;
  isPlayer: boolean;

  roleObj: Phaser.GameObjects.Sprite;
  roleMoveToObj?: Phaser.GameObjects.Sprite;
  movesObj?: Phaser.GameObjects.Group;

  constructor(
    scene: Phaser.Scene,
    components: ClientComponents,
    tileSize: number,
    {
      entity,
      isPlayer,
      onClick,
      onPointerOver,
      onPointerOut,
    }: {
      entity: Entity;
      isPlayer: boolean;
      onClick: () => void;
      onPointerOver: () => void;
      onPointerOut: () => void;
    }
  ) {
    this.scene = scene;
    this.components = components;
    this.tileSize = tileSize;

    this.entity = entity;
    const position = getComponentValue(components.Position, entity)!;
    this.x = position.x;
    this.y = position.y;
    this.positions = [{ x: this.x, y: this.y }];
    this.direction =
      getComponentValue(components.RoleDirection, entity)?.value ??
      Direction.DOWN;
    this.isPlayer = isPlayer;

    this.roleObj = this.scene.add
      .sprite(
        this.x * this.tileSize + this.tileSize / 2,
        this.y * this.tileSize + this.tileSize / 2,
        "host1"
      )
      .setDepth(2);
    this.idle();
  }

  // triggered whenever Moves component is updated
  movesUpdate() {
    const moves = getComponentValue(this.components.Moves, this.entity)?.value;
    if (!moves || moves.length === 0) {
      this.positions = [{ x: this.x, y: this.y }];
      this.roleMoveToObj?.destroy();
      this.movesObj?.clear(true, true);
      return;
    }
    const from = this.positions[this.positions.length - 1];
    this.positions = movesToPositions(moves, {
      x: this.x,
      y: this.y,
    });
    const to = this.positions[this.positions.length - 1];
    // update roleMovetoObj
    this.roleMoveToObj?.destroy();
    this.roleMoveToObj = this.scene.add
      .sprite(
        from.x * this.tileSize + this.tileSize / 2,
        from.y * this.tileSize + this.tileSize / 2,
        "host1"
      )
      .setDepth(5);
    this.scene.tweens.add({
      targets: this.roleMoveToObj,
      x: to.x * this.tileSize + this.tileSize / 2,
      y: to.y * this.tileSize + this.tileSize / 2,
      ease: "linear",
      duration: 200,
      repeat: 0,
      // onComplete: () => {
      //   this.idle();
      // },
    });
    this.walk();
    // update movesObj
    this.movesObj?.clear(true, true);
    this.movesObj = this.scene.add.group();
    // for each move of moves, add a line into the moves group
    for (let i = 0; i < this.positions.length - 1; i++) {
      const { x: x1, y: y1 } = this.positions[i];
      const { x: x2, y: y2 } = this.positions[i + 1];
      const line = this.scene.add.line(0, 0, 0, 0, 0, 0, 0xff0000).setDepth(10);
      line.setLineWidth(3);
      line.setPosition(
        x1 * this.tileSize + this.tileSize / 2,
        y1 * this.tileSize + this.tileSize / 2
      );
      line.geom.x2 = x2 * this.tileSize - x1 * this.tileSize;
      line.geom.y2 = y2 * this.tileSize - y1 * this.tileSize;
      this.movesObj.add(line);
    }
  }

  directionUpdate() {
    this.idle();
  }

  walk() {
    this.direction =
      getComponentValue(this.components.RoleDirection, this.entity)?.value ??
      Direction.DOWN;
    if (this.direction === Direction.UP)
      return this.roleMoveToObj?.play("host1-walk-up");
    if (this.direction === Direction.DOWN)
      return this.roleMoveToObj?.play("host1-walk-down");
    if (this.direction === Direction.LEFT)
      return this.roleMoveToObj?.play("host1-walk-left");
    if (this.direction === Direction.RIGHT)
      return this.roleMoveToObj?.play("host1-walk-right");
  }

  idle() {
    this.direction =
      getComponentValue(this.components.RoleDirection, this.entity)?.value ??
      Direction.DOWN;
    if (this.direction === Direction.UP)
      return this.roleObj.play("host1-idle-up");
    if (this.direction === Direction.DOWN)
      return this.roleObj.play("host1-idle-down");
    if (this.direction === Direction.LEFT)
      return this.roleObj.play("host1-idle-left");
    if (this.direction === Direction.RIGHT)
      return this.roleObj.play("host1-idle-right");
  }

  destroy() {
    this.roleObj.destroy();
    this.roleMoveToObj?.destroy();
    this.movesObj?.clear(true, true);
  }
}

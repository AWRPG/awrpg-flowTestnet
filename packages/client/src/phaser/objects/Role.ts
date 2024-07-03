import { ClientComponents } from "../../mud/createClientComponents";
import { Direction, movesToPositions } from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";
import { Hex } from "viem";
import { getPool } from "../../contract/hashes";
import { getPoolAmount, getPoolCapacity } from "../../logics/pool";
import { POOL_COLORS, POOL_TYPES, SOURCE } from "../../constants";

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
  movesObj?: Phaser.GameObjects.Group;

  pools: Record<Hex, Phaser.GameObjects.Graphics> = {};
  incrementY: number;

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
    this.incrementY = this.tileSize / 4;

    this.entity = entity;
    const position = getComponentValue(components.Position, entity)!;
    this.x = position.x;
    this.y = position.y;
    this.positions = [{ x: this.x, y: this.y }];
    this.direction =
      getComponentValue(components.RoleDirection, entity)?.value ??
      Direction.DOWN;
    this.isPlayer = isPlayer;

    POOL_TYPES.forEach((poolType, index) => {
      this.pools[poolType] = this.makePoolBar(poolType, index);
    });
    this.updatePoolBar();

    this.roleObj = this.scene.add
      .sprite(
        this.x * this.tileSize + this.tileSize / 2,
        this.y * this.tileSize + this.tileSize / 2,
        "host1"
      )
      .setDepth(2);
    this.idle();

    const role = getComponentValue(components.SelectedHost, SOURCE)?.value;
    if (role) this.follow();
  }

  follow() {
    this.scene.cameras.main.startFollow(this.roleObj, true);
  }

  unfollow() {
    this.scene.cameras.main.startFollow(this.roleObj, false);
  }

  // triggered whenever Moves component is updated
  movesUpdate() {
    const moves =
      getComponentValue(this.components.Moves, this.entity)?.value ?? [];
    this.positions = movesToPositions(moves, {
      x: this.x,
      y: this.y,
    });
    const to = this.positions[this.positions.length - 1];
    const poolObjs = Object.values(this.pools);
    const tweenTargets = [this.roleObj, ...poolObjs];
    const toX = to.x * this.tileSize + this.tileSize / 2;
    const toY = to.y * this.tileSize + this.tileSize / 2;
    tweenTargets.forEach((target, index) => {
      this.scene.tweens.add({
        targets: target,
        x: index === 0 ? toX : toX - this.tileSize / 2,
        y:
          index === 0 ? toY : toY - this.incrementY * index - this.tileSize / 2,
        duration: 200,
        repeat: 0,
      });
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
      return this.roleObj.play("host1-walk-up");
    if (this.direction === Direction.DOWN)
      return this.roleObj.play("host1-walk-down");
    if (this.direction === Direction.LEFT)
      return this.roleObj.play("host1-walk-left");
    if (this.direction === Direction.RIGHT)
      return this.roleObj.play("host1-walk-right");
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
    this.movesObj?.clear(true, true);
    POOL_TYPES.forEach((poolType) => {
      this.pools[poolType].destroy();
    });
  }

  makePoolBar(poolType: Hex, index: number) {
    const bar = this.scene.add.graphics();
    bar.fillStyle(POOL_COLORS[poolType], 1);
    bar.fillRect(0, 0, 30, 3).setDepth(5);
    return bar;
  }

  updatePoolBarPosition(poolType: Hex, index: number) {
    const position = this.positions[this.positions.length - 1];
    const x = position.x * this.tileSize;
    const y = position.y * this.tileSize - this.incrementY * index;
    this.pools[poolType].setPosition(x, y);
  }

  setPoolBarValue(poolType: Hex) {
    const poolAmount = getPoolAmount(
      this.components,
      this.entity as Hex,
      poolType
    );
    const poolCapacity = getPoolCapacity(
      this.components,
      this.entity as Hex,
      poolType
    );
    this.pools[poolType].scaleX = Number(poolAmount) / Number(poolCapacity);
  }

  updatePoolBar() {
    POOL_TYPES.forEach((poolType, index) => {
      this.setPoolBarValue(poolType);
      this.updatePoolBarPosition(poolType, index);
    });
  }
}

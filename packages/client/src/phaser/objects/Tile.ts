import { ClientComponents } from "../../mud/createClientComponents";
import {
  Direction,
  movesToPositions,
  splitFromEntity,
} from "../../logics/move";
import { Entity, ComponentValue, getComponentValue } from "@latticexyz/recs";
import { Hex } from "viem";
import { getPool } from "../../contract/hashes";
import { getPoolAmount, getPoolCapacity } from "../../logics/pool";
import {
  POOL_COLORS,
  POOL_TYPES,
  SOURCE,
  terrainMapping,
} from "../../constants";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { Vector } from "../../utils/vector";

/**
 * About the scene object with avatar such as character or building
 */
export class Tile extends SceneObject {
  // tile: Phaser.GameObjects.Sprite;
  tileSrpites: Record<number, Phaser.GameObjects.GameObject> = {};
  tileValue: string[];
  terrain: number = 0;

  cursor: Phaser.GameObjects.Sprite | undefined;

  constructor(
    scene: GameScene,
    components: ClientComponents,
    {
      entity,
      terrain,
      tileValue,
      onClick,
    }: {
      entity: Entity;
      terrain?: number;
      tileValue: string[];
      onClick: () => void;
    }
  ) {
    super(scene, entity);
    this.tileValue = tileValue;
    const tileCoord = splitFromEntity(entity);
    this.tileX = tileCoord.x;
    this.tileY = tileCoord.y;
    this.x = (this.tileX + 0.5) * this.tileSize;
    this.y = (this.tileY + 0.5) * this.tileSize;
    this.root.setPosition(this.x, this.y).setDepth(1);

    tileValue.forEach((tile, index) => {
      const [texture, frame] = tile.split("&");
      if (texture === "pine_12") {
        const tileSprite = this.scene.add
          .image(
            this.x + (this.tileSize * (Math.random() - 0.5)) / 2,
            this.y + (this.tileSize * (Math.random() + 0.5)) / 2,
            "pine_12"
          )
          .setOrigin(0.5, 1)
          .setDepth(index + 5);
        this.tileSrpites[index] = tileSprite;
      } else {
        const tileSprite = new Phaser.GameObjects.Image(
          this.scene,
          0,
          0,
          texture,
          frame ?? ""
        )
          // .setDepth(index)
          .setInteractive()
          .on("pointerdown", () => {
            // console.log(texture, frame);
          });
        this.tileSrpites[index] = tileSprite;
        this.root.add(tileSprite);
      }
    });

    // this.tile.anims.play("grass_0_2");
  }

  select() {
    // this.cursor = this.scene.add
    //   .sprite(
    //     (this.tileX + 0.5) * this.tileSize,
    //     (this.tileY + 0.5) * this.tileSize,
    //     "ui-cursor"
    //   )
    //   .setDepth(14)
    //   .setScale(0.5)
    //   .play("ui-cursor-active");
    // this.follow();
  }

  unselect() {
    // this.cursor?.destroy();
    // this.unfollow();
  }

  destroy() {
    Object.values(this.tileSrpites).forEach((sprite) => sprite.destroy());
    this.cursor?.destroy();
  }
}

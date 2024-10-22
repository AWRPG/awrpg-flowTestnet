import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { Vector } from "../../utils/vector";
import { splitFromEntity } from "../../logics/move";
import { getEntitySpecs } from "../../logics/entity";

export class Building extends SceneObject {
  tileId: Entity;
  buildingSprite: Phaser.GameObjects.Sprite;
  entity: Entity;
  tileCoord: Vector;

  constructor(
    scene: GameScene,
    {
      tileId,
      entity,
      onClick,
      texture = "safe",
      scale = 1,
    }: {
      tileId: Entity;
      entity: Entity;
      onClick?: () => void;
      texture?: string;
      scale?: number;
    }
  ) {
    super(scene, entity);
    const { EntityType, BuildingSpecs } = this.components;
    this.entity = entity;
    this.tileId = tileId;
    this.tileCoord = splitFromEntity(tileId);

    const buildingType = getComponentValue(EntityType, entity)?.value;
    const buildingSpecs = getEntitySpecs(
      this.components,
      BuildingSpecs,
      entity
    )!;

    const { width, height } = buildingSpecs;

    // const buildingNumber = BUILDING_TYPES.indexOf(buildingType as Hex);
    // // buildingMapping[buildingNumber];

    this.tileX = this.tileCoord.x;
    this.tileY = this.tileCoord.y;
    // this.x = this.tileX * this.tileSize;
    // this.y = this.tileY * this.tileSize;
    // this.root.setPosition(this.x, this.y);
    this.root.setDepth(13).setScale(scale);

    const offsetX = 0.5 / width;
    const offsetY = 0.5 / height;

    this.buildingSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      texture
    ).setOrigin(offsetX, offsetY);
    this.root.add(this.buildingSprite);
  }

  destroy() {
    this.buildingSprite.destroy();
  }
}

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
    components: ClientComponents,
    {
      tileId,
      entity,
      onClick,
      texture = "safe",
      scale = 1,
    }: {
      tileId: Entity;
      onClick: () => void;
      entity: Entity;
      texture?: string;
      scale?: number;
    }
  ) {
    super(entity, components, scene);
    const { EntityType, BuildingSpecs } = components;
    this.entity = entity;
    this.tileId = tileId;
    this.tileCoord = splitFromEntity(tileId);

    const buildingType = getComponentValue(EntityType, entity)?.value;
    const buildingSpecs = getEntitySpecs(components, BuildingSpecs, entity)!;
    const {width, height} = buildingSpecs;
    // console.log(buildingSpecs)
    // const buildingNumber = BUILDING_TYPES.indexOf(buildingType as Hex);
    // // buildingMapping[buildingNumber];

    this.tileX = this.tileCoord.x;
    this.tileY = this.tileCoord.y;
    this.x = this.tileX * this.tileSize;
    this.y = this.tileY * this.tileSize;
    this.root.setPosition(this.x, this.y).setDepth(13).setScale(scale);

    this.buildingSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      texture
    ).setOrigin(0.5, 0.5);
    this.root.add(this.buildingSprite);
  }

  destroy() {
    this.buildingSprite.destroy();
  }
}

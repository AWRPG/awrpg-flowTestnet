import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { Vector } from "../../utils/vector";
import { splitFromEntity } from "../../logics/move";

export class Building extends SceneObject {
  tileId: Entity;
  buildingSprite: Phaser.GameObjects.TileSprite;
  entity: Entity;
  tileCoord: Vector;

  constructor(
    scene: GameScene,
    components: ClientComponents,
    {
      tileId,
      entity,
      onClick,
    }: {
      tileId: Entity;
      onClick: () => void;
      entity: Entity;
    }
  ) {
    super(entity, components, scene);
    const { EntityType } = components;
    this.entity = entity;
    this.tileId = tileId;
    this.tileCoord = splitFromEntity(tileId);

    const buildingType = getComponentValue(EntityType, entity)?.value;
    // const buildingNumber = BUILDING_TYPES.indexOf(buildingType as Hex);
    // // buildingMapping[buildingNumber];

    this.buildingSprite = scene.add
      .tileSprite(
        (this.tileCoord.x + 0.5) * this.tileSize,
        (this.tileCoord.y + 0.3) * this.tileSize,
        0,
        0,
        "safe"
      )
      .setScale(0.4)
      .setDepth(12);
  }

  destroy() {
    this.buildingSprite.destroy();
  }
}

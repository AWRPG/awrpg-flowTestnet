import { Entity, getComponentValue } from "@latticexyz/recs";
import { ClientComponents } from "../../mud/createClientComponents";
import { GameScene } from "../scenes/GameScene";
import { SceneObject } from "./SceneObject";
import { Vector } from "../../utils/vector";
import { splitFromEntity } from "../../logics/move";
import { getEntitySpecs } from "../../logics/entity";
import { GameData } from "../components/GameData";
import { BuildingData } from "../../api/data";
import { Hex, hexToString } from "viem";

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
      texture,
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

    const buildingType = getComponentValue(EntityType, entity)?.value as Hex;
    const buildingData = GameData.getDataByType(
      "buildings",
      hexToString(buildingType).replace(/\0/g, "") ?? "SAFE"
    ) as BuildingData;
    if (!texture) texture = buildingData.sceneImg;

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
    this.root.setDepth(13).setScale(scale);

    this.buildingSprite = new Phaser.GameObjects.Sprite(
      this.scene,
      0,
      0,
      texture
    );

    const dw = this.buildingSprite.displayWidth;
    const dh = this.buildingSprite.displayHeight;
    const offsetX = (dw + (1 - width) * this.tileSize) / (2 * dw);
    const offsetY = (dh + (height - 1) * this.tileSize) / (2 * dh);
    console.log(offsetX, offsetY);
    this.buildingSprite.setOrigin(offsetX, offsetY);
    this.root.add(this.buildingSprite);
  }

  destroy() {
    this.buildingSprite.destroy();
  }
}

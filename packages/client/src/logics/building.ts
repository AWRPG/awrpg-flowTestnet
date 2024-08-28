import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getBurnData, getCraftData } from "./convert";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { encodeTypeEntity } from "../utils/encode";
import { Vector } from "../utils/vector";
import { getEntitySpecs } from "./entity";

export const getBuildingTypeData = (
  components: ClientComponents,
  role: Hex = "" as Hex,
  buildingType: Hex
) => {
  const craftData = getCraftData(components, role, buildingType);
  const burnData = getBurnData(components, role, buildingType);
  // TODO: add upgrade info; and building specific functionalities?
  return { craftData, burnData };
};

// check if building type can be built on terrain type
export const canBuildingOnTerrain = (
  components: ClientComponents,
  terrainType: Hex,
  buildingType: Hex
) => {
  const buildingTypeEntity = encodeTypeEntity(buildingType) as Entity;
  return (
    (getComponentValue(components.BuildingSpecs, buildingTypeEntity)
      ?.terrainType as Hex) === terrainType
  );
};

export const canMoveToBuilding = (
  components: ClientComponents,
  building: Entity,
  entity?: Entity
) => {
  const canMove = getEntitySpecs(
    components,
    components.BuildingSpecs,
    building
  )?.canMove;
  return canMove ? true : false;
};

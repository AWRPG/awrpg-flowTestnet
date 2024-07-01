import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getBurnData, getCraftData } from "./convert";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { encodeTypeEntity } from "../utils/encode";

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

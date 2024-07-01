import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getBurnData, getCraftData, getInteractData } from "./convert";
import {
  Entity,
  HasValue,
  getComponentValue,
  runQuery,
} from "@latticexyz/recs";
import { decodeTypeEntity, encodeTypeEntity } from "../utils/encode";
import { SOURCE, terrainTypeMapping, TerrainType } from "../constants";
import { getDirectionCoord, getDirectionTerrain } from "./move";

// assumes host's direction is the selected terrain
export const getSelectedTerrainData = (components: ClientComponents) => {
  const { SelectedHost, Moves } = components;
  const host = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const toPosition = getDirectionCoord(components, host);
  const terrainValue = getDirectionTerrain(components, host) ?? 0;
  const terrainType = terrainTypeMapping[terrainValue as TerrainType];
  const terrainTypeData = getTerrainTypeData(
    components,
    host as Hex,
    terrainType
  );
  return { terrainTypeData, toPosition, terrainValue, host };
};

export const getTerrainTypeData = (
  components: ClientComponents,
  role: Hex = "" as Hex,
  terrainType: Hex
) => {
  const interactData = getInteractData(components, role, terrainType);
  const canBurn = terrainCanBurn(components, terrainType);
  const canMoveOn = terrainCanMoveOn(components, terrainType);
  const burnData = getBurnData(components, role, terrainType);
  const buildableTypes = getBuildableOnTerrain(components, terrainType);
  return { interactData, canBurn, burnData, buildableTypes, canMoveOn };
};

export const terrainCanBurn = (
  components: ClientComponents,
  terrainType: Hex
) => {
  const terrainTypeEntity = encodeTypeEntity(terrainType) as Entity;
  return (
    getComponentValue(components.TerrainSpecs, terrainTypeEntity)?.canBurn ??
    false
  );
};

export const terrainCanMoveOn = (
  components: ClientComponents,
  terrainType: Hex
) => {
  const terrainTypeEntity = encodeTypeEntity(terrainType) as Entity;
  return (
    getComponentValue(components.TerrainSpecs, terrainTypeEntity)?.canMove ??
    false
  );
};

export const getBuildableOnTerrain = (
  components: ClientComponents,
  terrainType: Hex
) => {
  const buildingTypeEntities = [
    ...runQuery([HasValue(components.BuildingSpecs, { terrainType })]),
  ];
  const buildingTypes = buildingTypeEntities.map((entity) =>
    decodeTypeEntity(entity as Hex)
  ) as Hex[];
  return buildingTypes;
};

import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getBurnData, getCraftData } from "./convert";
import { Entity, getComponentValue, Has, runQuery } from "@latticexyz/recs";
import { decodeTypeEntity, encodeTypeEntity } from "../utils/encode";
import { Vector } from "../utils/vector";
import { getEntitySpecs } from "./entity";
import { SystemCalls } from "../mud/createSystemCalls";
import { getTerrainEntityType, getTerrainType } from "./terrain";
import { getCoordId } from "./map";
import { getHostPosition } from "./path";
import { getFourCoords } from "./move";

export const getAllBuildingTypes = (components: ClientComponents) => {
  const buildingTypes = runQuery([Has(components.BuildingSpecs)]);
  return [...buildingTypes].map(
    (entity) => decodeTypeEntity(entity as Hex) as Hex
  );
};

export const getHasCostBuildingTypes = (
  components: ClientComponents,
  role: Hex
) => {
  const allBuildingTypes = getAllBuildingTypes(components);
  return allBuildingTypes.filter((buildingType) => {
    const data = getBuildingTypeData(components, role, buildingType);
    return data.craftData.hasCosts;
  });
};

// this return building info like burnData, craftData
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

// return which host's adjacent tile coord player can build building
// if cannot, return undefined
export const canBuildFromHost = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  role: Entity,
  lowerCoord: Vector,
  buildingType: Hex
) => {
  const coord = getHostPosition(components, role);
  if (!coord) return;
  const fourCoords = getFourCoords(coord);
  return fourCoords.find((coord) =>
    canBuildFromLowerCoord(
      components,
      systemCalls,
      coord,
      lowerCoord,
      buildingType
    )
  );
};

// check if building type can be built on the rectangle starting from lower coord
// similar to logics in contract
export const canBuildFromLowerCoord = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  coord: Vector,
  lowerCoord: Vector,
  buildingType: Hex
) => {
  const { BuildingSpecs } = components;
  const width = getComponentValue(
    BuildingSpecs,
    encodeTypeEntity(buildingType) as Entity
  )?.width;
  const height = getComponentValue(
    BuildingSpecs,
    encodeTypeEntity(buildingType) as Entity
  )?.height;
  if (!width || !height) return false;
  const tileCoords = getRectangleCoordsStrict(coord, lowerCoord, width, height);
  if (!tileCoords) return false;
  return canBuildOnTiles(components, systemCalls, tileCoords, buildingType);
};

export const getRectangleCoordsStrict = (
  coord: Vector,
  lowerCoord: Vector,
  width: number,
  height: number
) => {
  const upperCoord = {
    x: lowerCoord.x + width - 1,
    y: lowerCoord.y + height - 1,
  };
  const tileCoords = [];
  let isWithin = false;
  for (let x = lowerCoord.x; x <= upperCoord.x; x++) {
    for (let y = lowerCoord.y; y <= upperCoord.y; y++) {
      if (x === coord.x && y === coord.y) {
        isWithin = true;
      }
      tileCoords.push({ x, y });
    }
  }
  if (!isWithin) return;
  return tileCoords;
};

export const canBuildOnTiles = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  tileCoords: Vector[],
  buildingType: Hex
) => {
  return tileCoords.every((tileCoord) =>
    canBuildOnTile(components, systemCalls, tileCoord, buildingType)
  );
};

// check if building type can be built on tile id
// diff from contract, this also checks TileEntity table
export const canBuildOnTile = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  tileCoord: Vector,
  buildingType: Hex
) => {
  const terrainEntityType = getTerrainEntityType(
    components,
    systemCalls,
    tileCoord
  );
  const tileEntity = getTileEntity(components, tileCoord);
  if (tileEntity) return false;
  return canBuildingOnTerrain(components, terrainEntityType, buildingType);
};

export const getTileEntity = (
  components: ClientComponents,
  tileCoord: Vector
) => {
  const coordId = getCoordId(tileCoord.x, tileCoord.y) as Entity;
  const tileEntity = getComponentValue(components.TileEntity, coordId)?.value;
  return tileEntity;
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

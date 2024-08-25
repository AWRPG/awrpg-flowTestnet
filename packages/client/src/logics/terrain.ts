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
import {
  combine,
  getDirectionCoord,
  getTerrainOnDirection,
  splitFromEntity,
} from "./move";
import { SystemCalls } from "../mud/createSystemCalls";
import { Vector } from "../utils/vector";
import { getCoordId } from "./map";

export const GRID_SIZE = 8;

export const getPerlin = (systemCalls: SystemCalls, position: Vector) => {
  return systemCalls.getNoise(position.x, position.y);
};

export const noiseToTerrainType = (noise: number) => {
  if (25 <= noise && noise < 30) return TerrainType.MOUNTAIN;
  if (44 <= noise && noise < 55) return TerrainType.OCEAN;
  if (65 <= noise && noise < 70) return TerrainType.FOREST;
  else return TerrainType.PLAIN;
};

export const noiseToTerrainEntity = (noise: number) => {
  const terrain = noiseToTerrainType(noise);
  return terrainTypeMapping[terrain];
};

export const getTerrainType = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  position: Vector
): TerrainType => {
  const terrain = getTerrainFromTable(components, systemCalls, position);
  if (terrain !== TerrainType.NONE) return terrain;
  return noiseToTerrainType(getPerlin(systemCalls, position));
};

// get terrain type from Terrain table
export const getTerrainFromTable = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  position: Vector
): TerrainType => {
  const { Terrain } = components;
  const gridX = Math.floor(position.x / GRID_SIZE);
  const gridY = Math.floor(position.y / GRID_SIZE);
  const gridId = getCoordId(gridX, gridY) as Entity;
  const terrainValues = getComponentValue(Terrain, gridId)?.value ?? 0n;

  const offsetX = position.x % GRID_SIZE;
  const offsetY = position.y % GRID_SIZE;
  const shift = offsetX + offsetY * GRID_SIZE;
  const terrainValue = ((terrainValues as bigint) >> BigInt(shift * 4)) & 15n;
  return Number(terrainValue) as TerrainType;
  // const jsonStr = localStorage.getItem(coordId);
  // if (jsonStr) return JSON.parse(jsonStr).terrain ?? TerrainType.NONE;
  // const noise = getPerlin(systemCalls, position);
  // const terrain = noiseToTerrainType(noise) as number;
  // localStorage.setItem(coordId, JSON.stringify({ terrain }));
  // return terrain;
};

// ----------------- localStorage & clientComponent -----------------
// calc uint256 terrain type values for 1 grid; so that it can be stored in TerrainValues; also used to set in contract
export const compileGridTerrainValues = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  gridId: Entity
): bigint => {
  const terrainTypes = compileGridTerrainTypes(components, systemCalls, gridId);
  let terrainValues: bigint = 0n;
  terrainTypes.forEach(({ i, j, terrainType }) => {
    const shift = i + j * GRID_SIZE;
    terrainValues |= BigInt(terrainType) << BigInt(shift * 4);
  });
  return terrainValues;
};

// calc 8x8 terrain types for 1 grid from perlin & Terrain table
export const compileGridTerrainTypes = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  gridId: Entity
) => {
  const terrainValues = getComponentValue(components.Terrain, gridId)?.value;
  const gridCoord = splitFromEntity(gridId);
  const tileTerrains: { i: number; j: number; terrainType: number }[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const shift = i + j * GRID_SIZE;
      const tileCoord = {
        x: gridCoord.x * GRID_SIZE + i,
        y: gridCoord.y * GRID_SIZE + j,
      };
      const terrain = Number(
        ((terrainValues ?? 0n) >> BigInt(shift * 4)) & 15n
      );
      const terrainType =
        terrain === Number(TerrainType.NONE)
          ? noiseToTerrainType(getPerlin(systemCalls, tileCoord))
          : terrain;
      tileTerrains.push({
        i,
        j,
        terrainType,
      });
    }
  }
  return tileTerrains;
};

// ----------------------------------

// assumes host's direction is the selected terrain
export const getSelectedTerrainData = (components: ClientComponents) => {
  const { SelectedHost, Moves } = components;
  const host = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const toPosition = getDirectionCoord(components, host);
  const terrainValue = getTerrainOnDirection(components, host) ?? 0;
  const terrainType = terrainTypeMapping[terrainValue as TerrainType];
  const terrainTypeData = getTerrainTypeData(
    components,
    host as Hex,
    terrainType
  );
  return { terrainTypeData, toPosition, terrainValue, host };
};

export const getTerrainFromTerrainValue = (
  components: ClientComponents,
  position: Vector
) => {
  // TODO: coordId is not the same as TerrainValue's coordId
  const coordId = getCoordId(position.x, position.y) as Entity;
  return getComponentValue(
    components.TerrainValue,
    combine(position.x, position.y) as Entity
  )?.value;
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

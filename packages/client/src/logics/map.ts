import { Vector } from "matter";
import { TerrainType, terrainTypeMapping } from "../constants";
import { SystemCalls } from "../mud/createSystemCalls";
import { ClientComponents } from "../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { castToBytes32, encodeTypeEntity } from "../utils/encode";

export const noiseToTerrain = (noise: number) => {
  if (noise < 23) return TerrainType.Rock;
  if (noise < 40) return TerrainType.Water;
  if (noise < 55) return TerrainType.Grass;
  if (noise < 65) return TerrainType.Bush;
  if (noise < 78) return TerrainType.Tree;
  else return TerrainType.Stump;
};

export const noiseToTerrainType = (noise: number) => {
  const terrain = noiseToTerrain(noise);
  return terrainTypeMapping[terrain];
};

export const getPerlin = (systemCalls: SystemCalls, position: Vector) => {
  return systemCalls.getNoise(position.x, position.y);
};

export const getTerrain = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  position: Vector
) => {
  const coordId = getCoordId(position.x, position.y) as Entity;
  const isRemoved =
    getComponentValue(components.RemovedCoord, coordId)?.value ?? false;
  if (isRemoved) return TerrainType.Grass;
  const noise = getPerlin(systemCalls, position);
  const terrain = noiseToTerrain(noise);
  return terrain;
};

export const canMoveTo = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  position: Vector
) => {
  const { EntityCoord, TerrainSpecs } = components;
  const terrain = getTerrain(components, systemCalls, position);
  const terrainType = terrainTypeMapping[terrain];
  const terrainTypeEntity = encodeTypeEntity(terrainType) as Entity;
  const terrainCanMove =
    getComponentValue(TerrainSpecs, terrainTypeEntity)?.canMove ?? false;

  const coordId = getCoordId(position.x, position.y) as Entity;
  const hasEntity = getComponentValue(EntityCoord, coordId) ? true : false;
  // console.log("hasEntity", coordId, hasEntity);
  return terrainCanMove && !hasEntity;
};

export function getCoordId(x: number, y: number) {
  const id = (BigInt(x) << BigInt(128)) | BigInt(y);
  return castToBytes32(id);
}

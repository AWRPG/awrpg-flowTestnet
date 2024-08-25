import { Vector } from "matter";
import { TerrainType, terrainTypeMapping } from "../constants";
import { SystemCalls } from "../mud/createSystemCalls";
import { ClientComponents } from "../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { castToBytes32, encodeTypeEntity } from "../utils/encode";
import { combine } from "./move";
import { getTerrainType } from "./terrain";

export const getEntityOnCoord = (
  components: ClientComponents,
  position: Vector
) => {
  const coordId = getCoordId(position.x, position.y) as Entity;
  return getComponentValue(components.TileEntity, coordId)?.value as Entity;
};

export const canMoveTo = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  host: Entity,
  position: Vector
) => {
  const { TileEntity, TerrainSpecs } = components;
  const terrain = getTerrainType(components, systemCalls, position);
  const terrainType = terrainTypeMapping[terrain];
  const terrainTypeEntity = encodeTypeEntity(terrainType) as Entity;
  const terrainCanMove =
    getComponentValue(TerrainSpecs, terrainTypeEntity)?.canMove ?? true;

  const hasEntity = hasEntityOnCoord(components, position);
  // console.log("hasEntity", coordId, hasEntity);
  // console.log("canMoveTo", position, terrainType, terrainCanMove, hasEntity);
  return terrainCanMove && !hasEntity;
};

export function getCoordId(x: number, y: number) {
  const id = (BigInt(x) << BigInt(128)) | BigInt(y);
  return castToBytes32(id);
}

export const hasEntityOnCoord = (
  components: ClientComponents,
  position: Vector
) => {
  const coordId = getCoordId(position.x, position.y) as Entity;
  return getComponentValue(components.TileEntity, coordId) ? true : false;
};

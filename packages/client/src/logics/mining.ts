import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { getCustodian } from "../contract/hashes";
import { SystemCalls } from "../mud/createSystemCalls";
import {
  DOWN_LIMIT_MINE,
  PERLIN_DENOM_MINE,
  UP_LIMIT_MINE,
  PERCENTAGE_MINE,
} from "../contract/constants";
import { Vector } from "../utils/vector";
import { getCoordId } from "./map";
import { random } from "../utils/random";

// checks if a role is mining, i.e., if its mininginfo's buildingId matches its owner custodian
export const isMining = (components: ClientComponents, role: Hex): boolean => {
  const { MiningInfo, Owner } = components;
  const buildingId = getComponentValue(MiningInfo, role as Entity)?.buildingId;
  if (!buildingId) return false;
  const owner = getComponentValue(Owner, role as Entity)?.value;
  if (!owner) return false;
  return owner === getCustodian(buildingId as Hex);
};

// TODO:
export const getMiningInfo = (components: ClientComponents, role: Hex) => {};

export const getPerlin = (systemCalls: SystemCalls, position: Vector) => {
  return systemCalls.getNoise(position.x, position.y, PERLIN_DENOM_MINE);
};

export const hasMineFromGrid = (
  systemCalls: SystemCalls,
  gridCoord: Vector
) => {
  const coordId = getCoordId(gridCoord.x, gridCoord.y);
  const perlin = getPerlin(systemCalls, gridCoord);
  const randomInt = random(coordId, 100);
  return (
    perlin >= DOWN_LIMIT_MINE &&
    perlin <= UP_LIMIT_MINE &&
    randomInt < PERCENTAGE_MINE
  );
};

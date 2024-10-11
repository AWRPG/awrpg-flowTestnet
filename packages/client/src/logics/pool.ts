import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getPool } from "../contract/hashes";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { getBalance, getBalanceEntity, useBalance } from "./container";
import { getEntitySpecs } from "./entity";
import { fromEntity } from "../utils/encode";
import { useComponentValue } from "@latticexyz/react";

/**
 * note: pool amount is of number type although balance is not
 */

export const useRolePoolInfo = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  const capacity = usePoolCapacity(components, role, poolType);
  const balance = usePoolAmount(components, role, poolType);
  if (capacity === 0) return;
  return { poolType, capacity, balance };
};

export const hasPoolAmount = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex,
  amount: number
) => {
  return getPoolAmount(components, role, poolType) >= amount;
};

export const getPoolAmount = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  return Number(getBalance(components, role, poolType));
};

export const usePoolAmount = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  const balance = useBalance(components, role, poolType);
  return Number(balance);
};

// check if role has pool in its StatsSpecs maxPools
export const hasPoolCapaicty = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  return getPoolCapacity(components, role, poolType) !== 0;
};

export const getPoolCapacity = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  const { StatsSpecs } = components;
  const maxPoolsHex = (getComponentValue(StatsSpecs, role)?.maxPools ??
    []) as Hex[];
  const maxPools = maxPoolsHex.map((pool) => fromEntity(pool));
  const maxPool = maxPools.find((pool) => pool.type === poolType)?.id ?? 0n;
  return Number(maxPool);
};

// used when pool capacity is upgraded
export const usePoolCapacity = (
  components: ClientComponents,
  role: Entity,
  poolType: Hex
) => {
  const { StatsSpecs } = components;
  const maxPoolsHex = (useComponentValue(StatsSpecs, role)?.maxPools ??
    []) as Hex[];
  const maxPools = maxPoolsHex.map((pool) => fromEntity(pool));
  const maxPool = maxPools.find((pool) => pool.type === poolType)?.id ?? 0n;
  return Number(maxPool);
};

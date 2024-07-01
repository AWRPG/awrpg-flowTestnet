import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getPool } from "../contract/hashes";
import { Entity, getComponentValue } from "@latticexyz/recs";
import { getBalance, getBalanceEntity } from "./container";
import { getEntitySpecs } from "./entity";

export const hasPoolBalance = (
  components: ClientComponents,
  role: Hex,
  poolType: Hex,
  amount: bigint
) => {
  return getPoolAmount(components, role, poolType) >= amount;
};

export const getPoolAmount = (
  components: ClientComponents,
  role: Hex,
  poolType: Hex
): bigint => {
  const pool = getPool(role, poolType);
  return getBalance(components, pool as Entity, poolType);
};

export const getPoolCapacity = (
  components: ClientComponents,
  role: Hex,
  poolType: Hex
): bigint => {
  const pool = getPool(role, poolType) as Entity;
  return (
    getEntitySpecs(components, components.ContainerSpecs, pool)?.capacity ?? 0n
  );
};

import { Entity, getComponentValue } from "@latticexyz/recs";
import { useMUD } from "../MUDContext";
import { POOL_COLORS, POOL_COLORS_STRING, POOL_TYPES } from "../constants";
import { getPool } from "../contract/hashes";
import { Hex, hexToString } from "viem";
import { getPoolCapacity, getPoolAmount } from "../logics/pool";
import HealthBar from "./HealthBar";
import { getEntitySpecs } from "../logics/entity";
import EntityName from "./EntityName";

// rn, role info includes 1) capacity, 2) size, 3) pool data,
// future, can includes: buildings, upgrades, etc
export default function RoleInfo({ role }: { role: Entity }) {
  const { components } = useMUD();
  const { ContainerSpecs, StoredSize } = components;

  const poolsData = POOL_TYPES.map((poolType) => {
    return {
      pool: getPool(role as Hex, poolType),
      poolType,
      capacity: getPoolCapacity(components, role as Hex, poolType),
      balance: getPoolAmount(components, role as Hex, poolType),
    };
  });

  const capacity =
    getEntitySpecs(components, ContainerSpecs, role)?.capacity ?? 0n;
  const storedSize = getComponentValue(StoredSize, role)?.value ?? 0n;

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex flex-row justify-between">
        <span>ROLE NAME: </span>
        <EntityName entity={role} />
      </div>
      {poolsData.map(({ pool, poolType, capacity, balance }) => (
        <div key={poolType}>
          <HealthBar
            value={Number(balance)}
            fillColor={POOL_COLORS_STRING[poolType]}
            maxValue={Number(capacity)}
            text={hexToString(poolType)}
          />
        </div>
      ))}
      <div>
        <HealthBar
          value={Number(storedSize)}
          fillColor="white"
          maxValue={Number(capacity)}
          text="Bag Capacity"
        />
      </div>
    </div>
  );
}

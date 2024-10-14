import { Entity } from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import {
  useMinedAmount,
  useMiningInfo,
  useStartMineTile,
} from "../../logics/mining";
import { Hex, hexToString } from "viem";
import { splitFromEntity } from "../../logics/move";
import { useComponentValue } from "@latticexyz/react";
import { canStoreERC20Amount } from "../../logics/container";
import { BERRY } from "../../contract/constants";

/**
 * display MiningInfo & StopButton if isPlayer; if !isMining, return null
 */
export function Mining({ role }: { role: Entity }) {
  const { components, network } = useMUD();
  const { Commander } = components;
  const isPlayer =
    (useComponentValue(Commander, role)?.value as Entity) ===
    network.playerEntity;
  const isMining = useMiningInfo(components, role);
  if (!isMining) return null;
  return (
    <div className="flex flex-row space-x-2">
      <MiningInfo role={role} />
      {isPlayer && <StopMining role={role} />}
    </div>
  );
}

/**
 * display mined amount/maxAmount for role to store
 */
export function MiningInfo({ role }: { role: Entity }) {
  const { components } = useMUD();
  const { StoredSize } = components;
  // TODO: add different resourceType
  const resourceType = BERRY;
  // reason to useComponent is to reload component when things added to role
  useComponentValue(StoredSize, role);
  const maxAmount = Number(canStoreERC20Amount(components, resourceType, role));
  let amount = useMinedAmount(components, role);
  if (!amount) return null;
  amount = amount < maxAmount ? amount : maxAmount;
  return (
    <div>
      Mined {hexToString(resourceType)}: {amount}/max: {maxAmount}
    </div>
  );
}

/**
 * display StartMining button if isPlayer and can mine (checked by useStartMineTile); called by Role component & assume not mining
 */
export function StartMining({ role }: { role: Entity }) {
  const { components, network, systemCalls } = useMUD();
  const { startMining } = systemCalls;
  const tileId = useStartMineTile(components, systemCalls, role);
  if (!tileId) return null;
  const tileCoord = splitFromEntity(tileId);

  return (
    <button
      className="ml-2 px-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-700 self-start"
      onClick={() => startMining(role as Hex, tileCoord)}
    >
      Start Mining
    </button>
  );
}

/**
 * display StopMining button; assumes role is mining
 */
export function StopMining({ role }: { role: Entity }) {
  const { systemCalls } = useMUD();
  const { stopMining } = systemCalls;

  return (
    <button
      className="ml-2 px-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-700 self-start"
      onClick={() => stopMining(role as Hex)}
    >
      Stop Mining
    </button>
  );
}

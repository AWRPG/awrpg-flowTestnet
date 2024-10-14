import { Entity } from "@latticexyz/recs";
import EntityName from "../EntityName";
import { EntityPools } from "./Pool";
import { Bag } from "./Bag";
import { useMUD } from "../../MUDContext";
import { useComponentValue } from "@latticexyz/react";
import { useCanExit } from "../../logics/building";

/**
 * display role's name, pools, bag, inBuilding, startMining, mining
 */
export function Role({ role }: { role: Entity }) {
  const { components, network } = useMUD();
  const { Commander, Owner } = components;
  const isPlayer =
    (useComponentValue(Commander, role)?.value as Entity) ===
    network.playerEntity;
  const canExit = useCanExit(components, role);

  return (
    <div className="flex flex-col space-y-3 w-96 bg-white">
      <EntityName entity={role} />
      <EntityPools entity={role} />
      <Bag host={role} />
    </div>
  );
}

// position

import { Entity } from "@latticexyz/recs";
import EntityName from "../EntityName";
import { EntityPools } from "../host/Pool";
import { Stored } from "./Stored";
import { useMUD } from "../../MUDContext";
import { getEntitySpecs } from "../../logics/entity";
import { EnterBuilding } from "./StoreBuilding";

/**
 * display building's name, pools, stored ft & nft, enterBuilding button
 */
export function Building({ building }: { building: Entity }) {
  const { components } = useMUD();
  const { ContainerSpecs } = components;
  const canStore = getEntitySpecs(components, ContainerSpecs, building)
    ? true
    : false;

  return (
    <div className="flex flex-col space-y-3 w-96 bg-white">
      <EntityName entity={building} />
      <EntityPools entity={building} />
      {canStore && <Stored building={building} />}
      {canStore && <EnterBuilding building={building} />}
    </div>
  );
}

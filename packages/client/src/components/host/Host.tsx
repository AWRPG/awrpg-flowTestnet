import { Entity } from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import { isBuilding } from "../../logics/entity";
import { Building } from "../building/Building";
import { Role } from "./Role";

/**
 * display a host, either a building or a role
 */
export function Host({ host }: { host: Entity }) {
  const { components } = useMUD();
  const buildingType = isBuilding(components, host);
  return (
    <>{buildingType ? <Building building={host} /> : <Role role={host} />}</>
  );
}

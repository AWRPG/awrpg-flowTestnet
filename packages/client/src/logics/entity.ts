import { Entity, getComponentValue, Component } from "@latticexyz/recs";
import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { encodeTypeEntity } from "../utils/encode";
import { BLOOD, STAMINA } from "../contract/constants";
import { POOL_TYPES } from "../constants";

export function getEntitySpecs<
  S extends ClientComponents[keyof ClientComponents]["schema"],
>(components: ClientComponents, specsComponent: Component<S>, entity: Entity) {
  const entityType = getComponentValue(components.EntityType, entity)
    ?.value as Hex;
  const specs = getComponentValue(
    specsComponent,
    encodeTypeEntity(entityType ?? "") as Entity
  );

  return specs;
}

export function isPoolType(entityType: Hex) {
  return POOL_TYPES.includes(entityType);
}

export function isBuildingType() {}

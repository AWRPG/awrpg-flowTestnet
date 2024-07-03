import {
  Entity,
  getComponentValue,
  Component,
  setComponent,
  HasValue,
  runQuery,
} from "@latticexyz/recs";
import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { encodeTypeEntity } from "../utils/encode";
import { BLOOD, HOST, STAMINA } from "../contract/constants";
import { POOL_TYPES, SOURCE } from "../constants";

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

export function isBuilding(components: ClientComponents, entity: Entity) {
  return (
    getEntitySpecs(components, components.BuildingSpecs, entity) !== undefined
  );
}

export function isRole(components: ClientComponents, entity: Entity) {
  const entityType = getComponentValue(components.EntityType, entity)
    ?.value as Hex;
  return entityType === HOST;
}

export function selectFirstHost(
  components: ClientComponents,
  playerEntity: Entity
) {
  const { Commander, SelectedHost } = components;
  const hosts = [...runQuery([HasValue(Commander, { value: playerEntity })])];
  setComponent(SelectedHost, SOURCE, { value: hosts[0] });
}

export function selectNextHost(
  components: ClientComponents,
  playerEntity: Entity
) {
  const { SelectedHost, Commander } = components;
  const selectedHost = getComponentValue(SelectedHost, SOURCE)?.value;
  const hosts = [...runQuery([HasValue(Commander, { value: playerEntity })])];
  const index = hosts.findIndex((host) => host === selectedHost);
  const nextIndex = (index + 1) % hosts.length;
  setComponent(SelectedHost, SOURCE, { value: hosts[nextIndex] });
}

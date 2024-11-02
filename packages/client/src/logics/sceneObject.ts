import {
  Entity,
  getComponentValue,
  Component,
  setComponent,
  HasValue,
  runQuery,
} from "@latticexyz/recs";
import { Hex, pad } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { encodeTypeEntity, fromEntity } from "../utils/encode";
import { BLOOD, HOST, MINER, STAMINA } from "../contract/constants";
import { POOL_TYPES, SOURCE } from "../constants";
import { SetupNetworkResult } from "../mud/setupNetwork";
import { useComponentValue } from "@latticexyz/react";
import { getHostsEntity } from "./entity";
import { hexTypeToString } from "../utils/encode";
import { getERC721s } from "./container";

export function getHosts(
  components: ClientComponents,
  network: SetupNetworkResult
) {
  const hostsEntity = getHostsEntity(components, network);
  return hostsEntity.map((entity) => {
    const { type, id } = fromEntity(entity as Hex);
    const name =
      getComponentValue(components.HostName, entity)?.name ?? "無名氏";
    return {
      entity,
      type: hexTypeToString(type),
      id: Number(id),
      name,
    };
  });
}

export function getHostsInHost(components: ClientComponents, store: Entity) {
  const hostsEntity = getERC721s(components, store);
  return hostsEntity
    .map((entity) => {
      const { type, id } = fromEntity(entity as Hex);
      const name =
        getComponentValue(components.HostName, entity)?.name ?? "無名氏";
      return {
        entity,
        type: hexTypeToString(type),
        id: Number(id),
        name,
      };
    })
    .filter((erc721) => erc721.type === "host");
}

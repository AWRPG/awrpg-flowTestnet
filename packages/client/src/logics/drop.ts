import { Entity } from "@latticexyz/recs";
import { DROP } from "../contract/constants";
import { castToBytes32 } from "../utils/encode";
import { getERC20Balances, getERC721s } from "./container";
import { ClientComponents } from "../mud/createClientComponents";

export const getERC721Drops = (
  components: ClientComponents,
  tileX: number,
  tileY: number
) => {
  const dropId = getDropContainer(tileX, tileY);
  return getERC721s(components, dropId as Entity);
};

export const getERC20Drops = (
  components: ClientComponents,
  tileX: number,
  tileY: number
) => {
  const dropId = getDropContainer(tileX, tileY);
  return getERC20Balances(components, dropId);
};

export const isDropContainer = (entity: Entity) => {
  const { drop } = splitDropContainer(BigInt(entity));
  return drop === BigInt(DROP);
};

export const getDropContainer = (tileX: number, tileY: number) => {
  const result =
    (BigInt(DROP) << BigInt(128)) |
    (BigInt(tileX) << BigInt(64)) |
    BigInt(tileY);
  return castToBytes32(result);
};

export const splitDropContainer = (container: bigint) => {
  const drop = container >> 128n;
  const xy = container & 0xffffffffffffffffffffffffffffffffn;
  const tileX = Number(xy >> 64n);
  const tileY = Number(xy & 0xffffffffffffffffn);
  console.log({ drop, tileX, tileY });
  return { drop, tileX, tileY };
};

import { Entity } from "@latticexyz/recs";
import { Hex, toHex } from "viem";
import { OCEAN, FOREST, PLAIN, MOUNTAIN } from "./contract/constants";
import {
  BERRY,
  BLOOD,
  BUSH,
  FENCE,
  FISH,
  FOUNDRY,
  GRASS,
  GRAVEL,
  NODE,
  RED,
  RED_MINE,
  ROCK,
  SAFE,
  SAND,
  SOUL,
  STAMINA,
  STUMP,
  TREE,
  WATER,
  WOOD,
  YELLOW,
} from "./contract/constants";

export enum TerrainType {
  // new (& only) terrain type
  NONE = 0,
  OCEAN = 1,
  FOREST = 2,
  PLAIN = 3,
  MOUNTAIN = 4,
  // this is client terrain, equal to PLAIN
  MUD = 5,
}

// to display sprites
export const terrainMapping = [
  "none",
  "ocean",
  "forest",
  "plain",
  "mountain",
  "mud",
];

export const terrainTypeMapping = {
  [TerrainType.OCEAN]: OCEAN,
  [TerrainType.FOREST]: FOREST,
  [TerrainType.PLAIN]: PLAIN,
  [TerrainType.MOUNTAIN]: MOUNTAIN,
  [TerrainType.NONE]: "0" as Hex,
  [TerrainType.MUD]: "0" as Hex,
};

export const POOL_TYPES = [SOUL, STAMINA, BLOOD];
export const POOL_COLORS = {
  [SOUL]: 0xffff00,
  [STAMINA]: 0x0000ff,
  [BLOOD]: 0xff0000,
};

export const POOL_COLORS_STRING = {
  [SOUL]: "gold",
  [STAMINA]: "blue",
  [BLOOD]: "red",
};

export const ERC20_TYPES = [WOOD, BERRY, FISH, RED, YELLOW];
export const BUILDING_TYPES = [SAFE, NODE, FOUNDRY, FENCE];
export const buildingMapping = ["safe", "node", "foundry", "fence"];

export const SOURCE = toHex("SOURCE", { size: 32 }) as Entity;
export const TARGET = toHex("TARGET", { size: 32 }) as Entity;
export const SELECTED = toHex("SELECTED", { size: 32 }) as Entity;
export const OBSERVER = toHex("OBSERVER", { size: 32 }) as Entity;

export const MENU = toHex("MENU", { size: 32 }) as Entity;
export const MAIN_MENU = toHex("MAIN_MENU", { size: 32 }) as Entity;
export const ROLE_MENU = toHex("ROLE_MENU", { size: 32 }) as Entity;
export const BAG_MENU = toHex("BAG_MENU", { size: 32 }) as Entity;

export const ITEM_MENU = toHex("ITEM_MENU", { size: 32 }) as Entity;
export const SELECT_MENU = toHex("SELECT_MENU", { size: 32 }) as Entity;

export const SWAP_CONTROL_MENU = toHex("SWAP_CONTROL_MENU", {
  size: 32,
}) as Entity;
export const SWAP_MENU = toHex("SWAP_MENU", { size: 32 }) as Entity;

export const EXPLORE_MENU = toHex("EXPLORE_MENU", { size: 32 }) as Entity;

export const TERRAIN_MENU = toHex("TERRAIN_MENU", { size: 32 }) as Entity;
export const TERRAIN_BURN_MENU = toHex("TERRAIN_BURN_MENU", {
  size: 32,
}) as Entity;
export const TERRAIN_INTERACT_MENU = toHex("TERRAIN_INTERACT_MENU", {
  size: 32,
}) as Entity;
export const TERRAIN_BUILD_MENU = toHex("TERRAIN_BUILD_MENU", {
  size: 32,
}) as Entity;

export const BUILDING_MENU = toHex("BUILDING_MENU", { size: 32 }) as Entity;
export const TRANSFER_MENU = toHex("TRANSFER_MENU", { size: 32 }) as Entity;

export const TARGET_MENU = toHex("TARGET_MENU", { size: 32 }) as Entity;

export const ALIGNMODES = {
  NONE: "none",
  LEFT_TOP: "leftTop",
  LEFT_BOTTOM: "leftBottom",
};

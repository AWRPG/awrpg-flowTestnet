import { Entity } from "@latticexyz/recs";
import { toHex } from "viem";
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
  Grass = 0,
  Water = 1,
  Bush = 2,
  Rock = 3,
  Tree = 4,
  Gravel = 5,
  Sand = 6,
  Stump = 7,
  RED_MINE = 8,
}

// to display sprites
export const terrainMapping = [
  "grass",
  "water",
  "bush",
  "rock",
  "tree",
  "gravel",
  "sand",
  "stump",
  "redmine",
];

export const terrainTypeMapping = {
  [TerrainType.Grass]: GRASS,
  [TerrainType.Water]: WATER,
  [TerrainType.Bush]: BUSH,
  [TerrainType.Rock]: ROCK,
  [TerrainType.Tree]: TREE,
  [TerrainType.Gravel]: GRAVEL,
  [TerrainType.Sand]: SAND,
  [TerrainType.Stump]: STUMP,
  [TerrainType.RED_MINE]: RED_MINE,
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

export const MENU = toHex("MENU", { size: 32 }) as Entity;
export const MAIN_MENU = toHex("MAIN_MENU", { size: 32 }) as Entity;
export const ROLE_MENU = toHex("ROLE_MENU", { size: 32 }) as Entity;
export const BAG_MENU = toHex("BAG_MENU", { size: 32 }) as Entity;

export const ITEM_MENU = toHex("ITEM_MENU", { size: 32 }) as Entity;
export const SELECT_MENU = toHex("SELECT_MENU", { size: 32 }) as Entity;

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

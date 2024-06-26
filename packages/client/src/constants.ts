import { Entity } from "@latticexyz/recs";
import { toHex } from "viem";
import {
  BUSH,
  GRASS,
  GRAVEL,
  RED_MINE,
  ROCK,
  SAND,
  STUMP,
  TREE,
  WATER,
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

export const SOURCE = toHex("SOURCE", { size: 32 }) as Entity;

import { TerrainType } from "../constants";

export const noiseToTerrain = (noise: number) => {
  if (noise < 23) return TerrainType.Rock;
  if (noise < 40) return TerrainType.Water;
  if (noise < 55) return TerrainType.Grass;
  if (noise < 65) return TerrainType.Bush;
  if (noise < 78) return TerrainType.Tree;
  else return TerrainType.Stump;
};

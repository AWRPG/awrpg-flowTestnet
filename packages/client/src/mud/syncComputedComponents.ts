import {
  ComponentValue,
  Entity,
  getComponentValue,
  setComponent,
} from "@latticexyz/recs";
import { SetupResult } from "./setup";
import { combine } from "../logics/move";
import { ClientComponents } from "./createClientComponents";
import { TerrainType } from "../constants";
import { noiseToTerrain } from "../logics/map";

export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValue } = components;

  // const space = pad(network.worldContract.address) as Hex;

  const width = 64;
  const height = 64;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const noise = systemCalls.getNoise(i, j);
      const terrainValue = noiseToTerrain(noise);
      setComponent(TerrainValue, combine(i, j) as Entity, {
        value: terrainValue as number,
      });
    }
  }
}

// export const  setTerrainValue = (
//   components: ClientComponents,
//   x: number, y: number,
//   noise: number
// ) => {
//   const { TerrainValue } = components;
//   // setComponent(TerrainValue, entity, { value });
// }

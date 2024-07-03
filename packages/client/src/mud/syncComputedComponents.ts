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
import { getTerrain, noiseToTerrain } from "../logics/map";

export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValue } = components;

  // const space = pad(network.worldContract.address) as Hex;

  const width = 64;
  const height = 64;

  const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  if (!role) {
    selectFirstHost(components, network.playerEntity);
  }
      const terrainValue = getTerrain(components, systemCalls, { x: i, y: j });
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

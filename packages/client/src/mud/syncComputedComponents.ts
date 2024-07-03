import {
  ComponentValue,
  Entity,
  Has,
  HasValue,
  getComponentValue,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { SetupResult } from "./setup";
import { combine, movesToPositions } from "../logics/move";
import { ClientComponents } from "./createClientComponents";
import { SOURCE, TerrainType } from "../constants";
import { getTerrain, noiseToTerrain } from "../logics/map";
import { selectFirstHost } from "../logics/entity";

export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValue, SelectedHost, Position } = components;

  // const space = pad(network.worldContract.address) as Hex;

  const width = 32;
  const height = 32;

  const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  if (!role) {
    selectFirstHost(components, network.playerEntity);
  }

  const coordIds = [...runQuery([Has(TerrainValue)])];
  coordIds.forEach((coordId) => removeComponent(TerrainValue, coordId));

  const position = getComponentValue(Position, role) ?? { x: 0, y: 0 };
  // const moves = getComponentValue(components.Moves, role)?.value ?? [];
  // const positions = movesToPositions(moves, position);
  // const from = positions[positions.length - 1];
  const x = position.x ?? width;
  const y = position.y ?? height;

  for (let i = Math.max(0, x - width); i < x + width; i++) {
    for (let j = Math.max(0, y - height); j < y + height; j++) {
      const coordId = combine(i, j) as Entity;
      if (getComponentValue(TerrainValue, coordId)?.value) continue;
      const terrainValue = getTerrain(components, systemCalls, { x: i, y: j });
      setComponent(TerrainValue, coordId, {
        value: terrainValue as number,
      });
    }
  }
  // // clear up terrainValue on four sides
  // // right side
  // const rightX = Math.max(0, x - width - 1);
  // for (let j = Math.max(0, y - height - 1); j < y + height + 1; j++) {
  //   const coordId = combine(rightX, j) as Entity;
  //   if (getComponentValue(TerrainValue, coordId)?.value === undefined) continue;
  //   removeComponent(TerrainValue, coordId);
  // }
  // // left side
  // const leftX = x + width;
  // for (let j = Math.max(0, y - height - 1); j < y + height + 1; j++) {
  //   const coordId = combine(leftX, j) as Entity;
  //   if (getComponentValue(TerrainValue, coordId)?.value === undefined) continue;
  //   removeComponent(TerrainValue, coordId);
  // }
  // // top side
  // const topY = Math.max(0, y - height - 1);
  // for (let i = Math.max(0, x - width); i < x + width; i++) {
  //   const coordId = combine(i, topY) as Entity;
  //   if (getComponentValue(TerrainValue, coordId)?.value === undefined) continue;
  //   removeComponent(TerrainValue, coordId);
  // }
  // // bottom side
  // const bottomY = y + height;
  // for (let i = Math.max(0, x - width); i < x + width; i++) {
  //   const coordId = combine(i, bottomY) as Entity;
  //   if (getComponentValue(TerrainValue, coordId)?.value === undefined) continue;
  //   removeComponent(TerrainValue, coordId);
  // }
}

// export const  setTerrainValue = (
//   components: ClientComponents,
//   x: number, y: number,
//   noise: number
// ) => {
//   const { TerrainValue } = components;
//   // setComponent(TerrainValue, entity, { value });
// }

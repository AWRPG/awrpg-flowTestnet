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
import { combine, movesToPositions, split } from "../logics/move";
import { ClientComponents } from "./createClientComponents";
import { SOURCE, TerrainType } from "../constants";
import { getTerrain, noiseToTerrain } from "../logics/map";
import { selectFirstHost } from "../logics/entity";

// note: there is an optimzation issue here. When TerrainValue gets updated,
// phaser going to render new tile sprites, and the delay is noticable when
// switching character position
export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValue, SelectedHost, Position } = components;

  // const space = pad(network.worldContract.address) as Hex;

  const width = 40;
  const height = 40;

  const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  if (!role) {
    selectFirstHost(components, network.playerEntity);
  }

  const initX = 2 ** 16; // 32 * 10;
  const initY = 2 ** 16; // 32 * 10;
  const position = getComponentValue(Position, role) ?? { x: initX, y: initY };
  // const moves = getComponentValue(components.Moves, role)?.value ?? [];
  // const positions = movesToPositions(moves, position);
  // const from = positions[positions.length - 1];
  const x = position.x; //?? width;
  const y = position.y; // ?? height;

  const currCoordIds: Entity[] = [];
  for (let i = Math.max(0, x - width); i < x + width; i++) {
    for (let j = Math.max(0, y - height); j < y + height; j++) {
      currCoordIds.push(combine(i, j) as Entity);
    }
  }

  const prevCoordIds = [...runQuery([Has(TerrainValue)])];
  prevCoordIds.forEach((prev) => {
    if (!currCoordIds.includes(prev)) removeComponent(TerrainValue, prev);
  });

  currCoordIds.forEach((curr) => {
    if (!getComponentValue(TerrainValue, curr)?.value) {
      const { x, y } = split(BigInt(curr));
      const terrainValue = getTerrain(components, systemCalls, { x, y });
      setComponent(TerrainValue, curr, {
        value: terrainValue as number,
      });
    }
  });

  // for (let i = Math.max(0, x - width); i < x + width; i++) {
  //   for (let j = Math.max(0, y - height); j < y + height; j++) {
  //     const coordId = combine(i, j) as Entity;
  //     if (getComponentValue(TerrainValue, coordId)?.value) continue;
  //     const terrainValue = getTerrain(components, systemCalls, { x: i, y: j });
  //     setComponent(TerrainValue, coordId, {
  //       value: terrainValue as number,
  //     });
  //   }
  // }
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

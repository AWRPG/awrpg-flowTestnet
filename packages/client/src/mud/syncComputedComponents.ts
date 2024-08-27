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
import {
  combine,
  combineToEntity,
  movesToPositions,
  split,
} from "../logics/move";
import { ClientComponents } from "./createClientComponents";
import { SOURCE, OBSERVER, TerrainType } from "../constants";
import {
  compileGridTerrainValues,
  getTerrainType,
  GRID_SIZE,
} from "../logics/terrain";
import { selectFirstHost } from "../logics/entity";
import { setupTileValues } from "./setupTiles";

// note: there is an optimzation issue here. When TerrainValue gets updated,
// phaser going to render new tile sprites, and the delay is noticable when
// switching character position
export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValues, SelectedHost, Path } = components;

  // const space = pad(network.worldContract.address) as Hex;

  const width = 4;
  const height = 4;

  const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  if (!role) {
    selectFirstHost(components, network.playerEntity);
  }

  const initX = 2 ** 16; // 32 * 10;
  const initY = 2 ** 16; // 32 * 10;
  const path = getComponentValue(Path, role);
  if (!path) {
    setComponent(components.TargetTile, OBSERVER, {
      value: combineToEntity(initX, initY),
    });
  }
  // const moves = getComponentValue(components.Moves, role)?.value ?? [];
  // const positions = movesToPositions(moves, position);
  // const from = positions[positions.length - 1];
  const x = (path?.toTileX as number) ?? initX; //?? width;
  const y = (path?.toTileY as number) ?? initY; // ?? height;
  console.log("syncComputedComponents", x, y);
  const gridCoord = {
    x: Math.floor(x / GRID_SIZE),
    y: Math.floor(y / GRID_SIZE),
  };
  const currGridIds: Entity[] = [];
  for (let i = Math.max(0, gridCoord.x - width); i < gridCoord.x + width; i++) {
    for (
      let j = Math.max(0, gridCoord.y - height);
      j < gridCoord.y + height;
      j++
    ) {
      currGridIds.push(combine(i, j) as Entity);
    }
  }

  const prevGridIds = [...runQuery([Has(TerrainValues)])];
  prevGridIds.forEach((prev) => {
    if (!currGridIds.includes(prev)) removeComponent(TerrainValues, prev);
  });
  currGridIds.forEach((curr) => {
    if (!getComponentValue(TerrainValues, curr)?.value) {
      const terrainValues = compileGridTerrainValues(
        components,
        systemCalls,
        curr
      );
      setComponent(TerrainValues, curr, { value: terrainValues });
      // const terrainValue = getTerrainType(components, systemCalls, { x, y });
      // localStorage.setItem(curr, JSON.stringify({ terrainValue }));
      // setComponent(TerrainValues, curr, {
      //   value: terrainValue as number,
      // });
    }
  });

  setupTileValues(components);

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

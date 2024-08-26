import {
  Entity,
  getComponentValue,
  Has,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { combineToEntity, splitFromEntity } from "../logics/move";
import { GRID_SIZE } from "../logics/terrain";
import { terrainMapping, TerrainType } from "../constants";
import { getNeighborTerrains, terrainToTileValue } from "../logics/tile";

// tile values depend on a complete of terrain values
export function setupTileValues(components: ClientComponents) {
  const { TerrainValues, TileValue } = components;
  // tileCoord -> terrain value
  const terrains: Record<Entity, TerrainType> = {};
  const currTileIds = new Set<Entity>();
  const prevTileIds = runQuery([Has(TileValue)]);
  const gridIds = [...runQuery([Has(TerrainValues)])];
  // loop gridIds to get each tile's terrain value & tileId
  gridIds.forEach((gridId) => {
    const gridCoord = splitFromEntity(gridId);
    const terrainValues = getComponentValue(TerrainValues, gridId)!.value;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const shift = i + j * GRID_SIZE;
        const tileCoord = {
          x: gridCoord.x * GRID_SIZE + i,
          y: gridCoord.y * GRID_SIZE + j,
        };
        const tileId = combineToEntity(tileCoord.x, tileCoord.y);
        const terrain = Number((terrainValues >> BigInt(shift * 4)) & 15n);
        terrains[tileId] = terrain;
        currTileIds.add(tileId);
      }
    }
  });

  // remove tiles that are not in current TileValue
  prevTileIds.difference(currTileIds).forEach((tileId) => {
    removeComponent(TileValue, tileId);
  });
  // add tiles that are not in previous TileValue
  currTileIds.difference(prevTileIds).forEach((tileId) => {
    const tileCoord = splitFromEntity(tileId);
    const neighbors = getNeighborTerrains(terrains, tileCoord);
    const terrain = terrains[tileId];
    const tileValue = terrainToTileValue(terrain, neighbors, tileId);
    setComponent(TileValue, tileId, { value: tileValue });
  });
  console.log("setupTileValues", terrains, currTileIds, prevTileIds);
}

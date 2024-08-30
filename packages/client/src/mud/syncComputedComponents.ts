import { Entity, getComponentValue, setComponent } from "@latticexyz/recs";
import { SetupResult } from "./setup";
import { combineToEntity, splitFromEntity } from "../logics/move";
import { SOURCE, OBSERVER, TerrainType } from "../constants";
import { selectFirstHost } from "../logics/entity";
import { setupTileValues } from "./setupTiles";
import { getHostPosition } from "../logics/path";
import { Vector } from "../utils/vector";
import { setupTerrains } from "./setupTerrains";
import { setupMines } from "./setupMines";

// note: there is an optimzation issue here. When TerrainValue gets updated,
// phaser going to render new tile sprites, and the delay is noticable when
// switching character position
export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TerrainValues, SelectedHost, Path, TargetTile } = components;

  const initX = 2 ** 16; // 32 * 10;
  const initY = 2 ** 16; // 32 * 10;

  // return if player has no role
  const role = getComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const source = role ?? selectFirstHost(components, network.playerEntity);
  const sourceCoord = getHostPosition(components, source);
  const targetCoordId = getComponentValue(TargetTile, source)?.value as Entity;

  let tileCoord: Vector;
  // if no source or source has no path, set tileCoord to be initX, initY
  // else, get the target tile coord; if no target tile, path is tile coord
  if (!sourceCoord) tileCoord = { x: initX, y: initY };
  else if (!targetCoordId) tileCoord = sourceCoord;
  else tileCoord = splitFromEntity(targetCoordId);

  setupTerrains(components, systemCalls, tileCoord);
  setupTileValues(components);
  setupMines(components, systemCalls, tileCoord);

  // set target tile when all tiles are rendered
  if (!targetCoordId)
    setComponent(TargetTile, source ?? OBSERVER, {
      value: combineToEntity(tileCoord.x, tileCoord.y),
    });
}

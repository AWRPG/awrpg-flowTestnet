import { Entity, getComponentValue, setComponent } from "@latticexyz/recs";
import { SetupResult } from "./setup";
import { combineToEntity, splitFromEntity } from "../logics/move";
import { SOURCE, OBSERVER, TerrainType } from "../constants";
import { getFirstHost, selectFirstHost } from "../logics/entity";
import { setupTileValues } from "./setupTiles";
import { getHostPosition, getPathEntityPosition } from "../logics/path";
import { Vector } from "../utils/vector";
import { setupTerrains } from "./setupTerrains";
import { setupMines } from "./setupMines";
import { mockPath } from "../logics/mock";

// issue is to initialize & update tileCoord and to update other terrains & tiles when tileCoord is changed
// tileCoord depends on which source is selected, what current targetTile is, and etc.
export function syncComputedComponents({
  components,
  systemCalls,
  network,
}: SetupResult) {
  const { TileEntity, SelectedHost, Path, TargetTile, Owner, MiningInfo } =
    components;

  const initX = 2 ** 16; // 32 * 10;
  const initY = 2 ** 16; // 32 * 10;

  // there are several scenarios, in the end, we need to get source & tileCoord to center it & set TargetTile
  const selectedSource = getComponentValue(SelectedHost, SOURCE)
    ?.value as Entity;
  console.log("selectedSource", selectedSource);
  let source = selectedSource ?? getFirstHost(components, network.playerEntity);
  if (!source) {
    source = OBSERVER;
    mockPath(components, source, { x: initX, y: initY });
  }
  setComponent(SelectedHost, SOURCE, { value: source });
  const sourceCoord = getPathEntityPosition(components, source);
  const targetCoordId = getComponentValue(TargetTile, source)?.value as Entity;

  // if source exists, but has no path, then it is either in building, is mining
  // or, set tileCoord to be initX, initY
  // initialize its path for clientside by mockPath()
  // else if no target tile, initialize tileCoord to be sourceCoord
  // else set tileCoord to be targetCoord (as it is updated)
  let tileCoord: Vector;
  if (!sourceCoord) {
    tileCoord = getHostPosition(components, network, source) ?? {
      x: initX,
      y: initY,
    };
    mockPath(components, source, tileCoord);
  } else if (!targetCoordId) tileCoord = sourceCoord;
  else tileCoord = splitFromEntity(targetCoordId);
  console.log("sync", source, tileCoord);

  setupTerrains(components, systemCalls, tileCoord);
  setupTileValues(components);
  setupMines(components, systemCalls, tileCoord);

  // set target tile when all tiles are rendered
  if (!targetCoordId)
    setComponent(TargetTile, source, {
      value: combineToEntity(tileCoord.x, tileCoord.y),
    });
}

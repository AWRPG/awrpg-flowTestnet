import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../MUDContext";
import {
  TERRAIN_BURN_MENU,
  EXPLORE_MENU,
  MAIN_MENU,
  MENU,
  SELECTED,
  SOURCE,
  TARGET,
  TERRAIN_MENU,
  TERRAIN_INTERACT_MENU,
  ROLE_MENU,
  BAG_MENU,
  TERRAIN_BUILD_MENU,
  BUILDING_MENU,
  TRANSFER_MENU,
  TARGET_MENU,
  SWAP_CONTROL_MENU,
  SWAP_MENU,
  OVERLAY,
} from "../constants";
import { Has, HasValue } from "@latticexyz/recs";
// import PoolBars from "./PoolBars";
import MainMenu from "./menu/MainMenu";
import ExploreMenu from "./menu/ExploreMenu";
import TerrainMenu from "./menu/TerrainMenu";
import TerrainBurnMenu from "./menu/TerrainBurnMenu";
import Console from "./Console";
import TerrainInteractMenu from "./menu/TerrainInteractMenu";
import RoleMenu from "./menu/RoleMenu";
import BagMenu from "./menu/BagMenu";
import TerrainBuildMenu from "./menu/TerrainBuildMenu";
import BuildingMenu from "./menu/BuildingMenu";
import TransferMenu from "./menu/TransferMenu";
import TargetMenu from "./menu/TargetMenu";
import SwapControlMenu from "./menu/SwapControlMenu";
import SwapMenu from "./menu/SwapMenu";
import { Role } from "./host/Role";
import { Tile } from "./tile/Tile";
import useHotkeys from "../hooks/useHotKeys";

export default function Overlay() {
  useHotkeys();
  const {
    components: {
      SelectedHost,
      Commander,
      SelectedEntity,
      ConsoleMessage,
      TargetTile,
      ToggledOn,
    },
    network: { playerEntity },
  } = useMUD();

  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value;
  const target = useComponentValue(SelectedHost, TARGET)?.value;
  const targetTile = useComponentValue(TargetTile, TARGET)?.value;

  const toggled = useComponentValue(ToggledOn, OVERLAY)?.value ?? false;

  const menu = useComponentValue(SelectedEntity, MENU)?.value;

  const message = useComponentValue(ConsoleMessage, SOURCE)?.value;

  const playerHosts = useEntityQuery([
    HasValue(Commander, { value: playerEntity }),
  ]);
  if (!toggled) return null;

  return (
    <div className="absolute h-full w-full pointer-events-none">
      {sourceHost && (
        <div className="absolute pointer-events-auto top-2 left-2">
          <Role role={sourceHost} />
        </div>
      )}
      {targetTile && (
        <div className="absolute pointer-events-auto bottom-2 left-2">
          <Tile tile={targetTile} />
        </div>
      )}
      <div className="relative h-full">
        <div className="absolute pointer-events-auto top-2 right-2 font-['Press_Start_2P']">
          {menu === MAIN_MENU && <MainMenu player={playerEntity} />}
          {menu === ROLE_MENU && <RoleMenu />}
          {menu === BAG_MENU && <BagMenu />}
          {menu === SWAP_CONTROL_MENU && <SwapControlMenu />}
        </div>
        <div className="absolute pointer-events-auto top-1/3 right-2">
          {menu === EXPLORE_MENU && <ExploreMenu />}
          {menu === TERRAIN_MENU && <TerrainMenu />}
          {menu === TERRAIN_BURN_MENU && <TerrainBurnMenu />}
          {menu === TERRAIN_INTERACT_MENU && <TerrainInteractMenu />}
          {menu === TERRAIN_BUILD_MENU && <TerrainBuildMenu />}
          {menu === BUILDING_MENU && <BuildingMenu />}
          {menu === TARGET_MENU && <TargetMenu />}
          {menu === TRANSFER_MENU && <TransferMenu />}
          {menu === SWAP_MENU && <SwapMenu />}
        </div>
        <div className="absolute pointer-events-auto bottom-2 w-1/2 left-1/4 h-48">
          {message && <Console message={message} />}
        </div>
      </div>
    </div>
  );
}

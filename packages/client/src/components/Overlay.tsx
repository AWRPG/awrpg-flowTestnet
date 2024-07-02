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

export default function Overlay() {
  const {
    components: { SelectedHost, Commander, SelectedEntity, ConsoleMessage },
    network: { playerEntity },
  } = useMUD();

  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value;
  const target = useComponentValue(SelectedHost, TARGET)?.value;

  const menu = useComponentValue(SelectedEntity, MENU)?.value;

  const message = useComponentValue(ConsoleMessage, SOURCE)?.value;

  const playerHosts = useEntityQuery([
    HasValue(Commander, { value: playerEntity }),
  ]);

  return (
    <div className="absolute h-full w-full pointer-events-none">
      {/* {sourceHost && <PoolBars host={sourceHost} />} */}
      <div className="relative h-full">
        <div className="absolute pointer-events-auto top-2 right-2">
          {menu === MAIN_MENU && <MainMenu player={playerEntity} />}
          {menu === ROLE_MENU && <RoleMenu />}
          {menu === BAG_MENU && <BagMenu />}
        </div>
        <div className="absolute pointer-events-auto top-1/2 right-2">
          {menu === EXPLORE_MENU && <ExploreMenu />}
          {menu === TERRAIN_MENU && <TerrainMenu />}
          {menu === TERRAIN_BURN_MENU && <TerrainBurnMenu />}
          {menu === TERRAIN_INTERACT_MENU && <TerrainInteractMenu />}
          {menu === TERRAIN_BUILD_MENU && <TerrainBuildMenu />}
        </div>
        <div className="absolute pointer-events-auto bottom-2 w-1/2 left-1/4 h-48">
          {message && <Console message={message} />}
        </div>
        {/* {source && (
          <div className="absolute pointer-events-auto top-2 left-2">
            <HostPanel host={source} />
          </div>
        )} */}
        {/* {target && (
          <div className="absolute pointer-events-auto top-2 right-2">
            <HostPanel host={target} />
          </div>
        )} */}
      </div>
      {/* <BuilderPanelModal /> */}
    </div>
  );
}

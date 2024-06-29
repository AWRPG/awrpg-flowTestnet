import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "../MUDContext";
import { MAIN_MENU, MENU, SELECTED, SOURCE, TARGET } from "../constants";
import { Has, HasValue } from "@latticexyz/recs";
// import PoolBars from "./PoolBars";
// import MainMenu from "./menu/MainMenu";

export default function Overlay() {
  const {
    components: { SelectedHost, Commander, SelectedEntity },
    network: { playerEntity },
  } = useMUD();

  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value;
  const target = useComponentValue(SelectedHost, TARGET)?.value;

  const menu = useComponentValue(SelectedEntity, MENU)?.value;

  const playerHosts = useEntityQuery([
    HasValue(Commander, { value: playerEntity }),
  ]);

  return (
    <div className="absolute h-full w-full pointer-events-none">
      {/* {sourceHost && <PoolBars host={sourceHost} />} */}
      <div className="relative h-full">
        <div className="absolute pointer-events-auto top-2 right-2">
          {/* {menu === MAIN_MENU && <MainMenu player={playerEntity} />} */}
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

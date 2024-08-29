import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import {
  Entity,
  HasValue,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import { Hex, hexToString } from "viem";
import {
  BUILDING_MENU,
  MENU,
  SOURCE,
  TARGET_MENU,
  TERRAIN_MENU,
  TerrainType,
} from "../../constants";
import { useState } from "react";
import useMenuKeys from "../../hooks/useMenuKeys";
import ItemContainer from "../ItemContainer";
import {
  calculatePathMoves,
  getEntityOnDirection,
  getTerrainOnDirection,
  hasPendingMoves,
  splitFromEntity,
} from "../../logics/move";
import { getEntityOnCoord } from "../../logics/map";
import { isBuilding, isRole } from "../../logics/entity";
import { getReadyPosition } from "../../logics/path";
import { SAFE } from "../../contract/constants";
import { getTargetTerrainData } from "../../logics/terrain";
import { canBuildFromHost, canBuildOnTile } from "../../logics/building";

export default function ExploreMenu() {
  const {
    components,
    systemCalls,
    network: { playerEntity },
  } = useMUD();
  const { Commander, Moves, SelectedHost, SelectedEntity } = components;
  const { move, spawnHero } = systemCalls;

  const [selected, setSelected] = useState(0);

  useMenuKeys({
    onUp: () => {
      setSelected((selected) => {
        const next = selected - 1;
        return next < 0 ? 0 : next;
      });
    },
    onDown: () => {
      setSelected((selected) => {
        const next = selected + 1;
        return next >= selections.length ? selections.length - 1 : next;
      });
    },
    onA: () => selections[selected].onClick(),
    onB: () => {
      setTimeout(() => {
        removeComponent(SelectedEntity, MENU);
      }, 100);
    },
    selected,
  });

  const hosts = useEntityQuery([
    HasValue(components.Commander, { value: playerEntity }),
  ]);
  const host = useComponentValue(SelectedHost, SOURCE)?.value as Entity;

  const moves = calculatePathMoves(components, host);
  console.log("ExploreMenu, moves", moves);
  const terrainData = getTargetTerrainData(components, systemCalls, host);
  console.log("ExploreMenu, terrainData", terrainData);
  if (!terrainData) return null;
  const tileCoord = terrainData.targetCoord;
  const allBuildingTypes = getAllBuildingTypes(components);
  const canBuildTypes = getHasCostBuildingTypes(components, host as Hex);
  console.log("ExploreMenu, building types", allBuildingTypes, canBuildTypes);
  // take SAFE as an example
  const hostDirectionCoord = canBuildFromHost(
    components,
    systemCalls,
    host,
    tileCoord,
    SAFE
  );
  console.log("ExploreMenu, canBuild", hostDirectionCoord);

  const terrainType = terrainData.terrainType;
  const entity = terrainData.coordEntity;
  const isBuildingType = isBuilding(components, entity as Entity);
  const isRoleType = isRole(components, entity as Entity);
  const nameToCheck =
    isBuildingType || isRoleType ? hexToString(entity as Hex) : terrainType;
  const menuToGo = isBuildingType
    ? BUILDING_MENU
    : isRoleType
      ? TARGET_MENU
      : TERRAIN_MENU;

  const selections = [
    {
      name: `Check ${nameToCheck}`,
      onClick: () => {
        setComponent(SelectedEntity, MENU, { value: menuToGo });
      },
    },
    {
      name: "$Move To",
      disabled: !host || !moves,
      onClick: async () => {
        console.log("Move To");
        if (!host || !moves) return;
        await move(host as Hex, moves);
        removeComponent(SelectedEntity, MENU);
      },
    },
    {
      name: "Build SAFE",
      onClick: async () => {
        if (!host) return;
        if (!hostDirectionCoord) return;
        await systemCalls.buildBuilding(
          host as Hex,
          SAFE,
          hostDirectionCoord,
          tileCoord
        );
      },
    },
    {
      name: "Change Terrain to OCEAN",
      onClick: async () => {
        await systemCalls.setTerrainValue(tileCoord, Number(TerrainType.OCEAN));
      },
    },
    // {
    //   name: "Cancel Moves",
    //   disabled: false,
    //   onClick: () => {
    //     if (!host) return removeComponent(SelectedEntity, MENU);
    //     removeComponent(Moves, host as Entity);
    //     // to avoid conflict with keyboard listener in GameScene
    //     setTimeout(() => {
    //       removeComponent(SelectedEntity, MENU);
    //     }, 100);
    //   },
    // },
  ];

  return (
    <div className="flex flex-col w-32 space-y-4 border p-1 bg-grey-500 text-white pointer-events-auto">
      {selections.map(({ name, onClick, disabled }, index) => (
        <ItemContainer
          key={index}
          className="btn btn-success border"
          onClick={onClick}
          disabled={disabled}
          selected={selected === index}
        >
          {name}
        </ItemContainer>
      ))}
    </div>
  );
}

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

export default function ExploreMenu() {
  const {
    components,
    systemCalls,
    network: { playerEntity },
  } = useMUD();
  const { Commander, Moves, SelectedHost, SelectedEntity } = components;
  const { move, spawnHero } = systemCalls;

  const hosts = useEntityQuery([
    HasValue(components.Commander, { value: playerEntity }),
  ]);
  const host = useComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const terrain = getTerrainOnDirection(components, host);
  const terrainType = terrain !== undefined ? TerrainType[terrain] : "unknown";
  const entity = getEntityOnDirection(components, host) as Hex;
  const isBuildingType = isBuilding(components, entity as Entity);
  const isRoleType = isRole(components, entity as Entity);
  const nameToCheck =
    isBuildingType || isRoleType ? hexToString(entity) : terrainType;
  const menuToGo = isBuildingType
    ? BUILDING_MENU
    : isRoleType
      ? TARGET_MENU
      : TERRAIN_MENU;

  const moves = calculatePathMoves(components, host);
  console.log("ExploreMenu, moves", moves);

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
        const coord = getReadyPosition(components, host as Entity);
        if (!coord) return;
        const tempCoord = { x: coord.x - 1, y: coord.y };
        const targetCoordId = getComponentValue(
          components.TargetTile,
          host as Entity
        )?.value;
        if (!targetCoordId) return;
        const targetCoord = splitFromEntity(targetCoordId);
        await systemCalls.buildBuilding(
          host as Hex,
          SAFE,
          tempCoord,
          targetCoord
        );
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

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
  getEntityOnDirection,
  getTerrainOnDirection,
  hasPendingMoves,
} from "../../logics/move";
import { getEntityOnCoord } from "../../logics/map";
import { isBuilding, isRole } from "../../logics/entity";

export default function ExploreMenu() {
  const {
    components,
    systemCalls: { move, spawnHero },
    network: { playerEntity },
  } = useMUD();
  const { Commander, Moves, SelectedHost, SelectedEntity } = components;

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

  const hasMoves = hasPendingMoves(components, host);

  const selections = [
    {
      name: `Check ${nameToCheck}`,
      onClick: () => {
        setComponent(SelectedEntity, MENU, { value: menuToGo });
      },
    },
    {
      name: "$Move To",
      disabled: !host || !hasMoves,
      onClick: async () => {
        console.log("Move To");
        if (!host || !hasMoves) return;
        const moves = getComponentValue(Moves, host as Entity)?.value;
        if (!moves || moves.length === 0) return;
        await move(host as Hex, moves);
        removeComponent(SelectedEntity, MENU);
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

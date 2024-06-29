import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import {
  Entity,
  HasValue,
  getComponentValue,
  removeComponent,
} from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import { Hex } from "viem";
import { MENU, SOURCE } from "../../constants";
import { useCallback, useState } from "react";
import useMenuKeys from "../../hooks/useMenuKeys";
import ItemContainer from "../ItemContainer";

export default function MainMenu({ player }: { player: Entity }) {
  const {
    components,
    systemCalls: { move, spawnHero },
    network: { playerEntity },
  } = useMUD();
  const { Commander, Moves, SelectedHost, SelectedEntity } = components;
  const isPlayer = player === playerEntity;

  const hosts = useEntityQuery([
    HasValue(components.Commander, { value: player }),
  ]);
  const host = useComponentValue(SelectedHost, SOURCE)?.value as Hex;
  const hasSpawned =
    useEntityQuery([HasValue(Commander, { value: playerEntity })]).length > 0;

  const selections = [
    {
      name: "Spawn Hero",
      disabled: hasSpawned,
      onClick: async () => {
        await spawnHero();
        removeComponent(SelectedEntity, MENU);
      },
    },
    {
      name: "Hosts",
      disabled: false,
      onClick: () => {
        console.log("Hosts");
      },
    },
    {
      name: "Move To",
      disabled: !host,
      onClick: async () => {
        console.log("Move To");
        if (!host) return;
        const moves = getComponentValue(Moves, SOURCE)?.value;
        if (!moves || moves.length === 0) return;
        await move(host, moves);
        removeComponent(SelectedEntity, MENU);
      },
    },
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

export function HostsMenu({ hosts }: { hosts: Entity[] }) {
  return <></>;
}

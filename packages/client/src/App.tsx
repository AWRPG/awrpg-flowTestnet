import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import useSyncComputedComponents from "./hooks/useSyncComputedComponents";
import useHotkeys from "./hooks/useHotKeys";
import { Entity, HasValue, getComponentValue } from "@latticexyz/recs";
import { SOURCE } from "./constants";
import { Hex } from "viem";

export const App = () => {
  useSyncComputedComponents();
  useHotkeys();
  const {
    components: { Commander, Moves, SelectedHost },
    systemCalls: { move, spawnHero },
    network: { playerEntity },
  } = useMUD();

  const host = useComponentValue(SelectedHost, SOURCE)?.value as Hex;
  const hasSpawned =
    useEntityQuery([HasValue(Commander, { value: playerEntity })]).length > 0;

  return (
    <div className="absolute h-full w-full text-white">
      <div className="flex flex-col w-32 space-y-4">
        {!hasSpawned && (
          <button
            className="btn btn-success border"
            onClick={async () => await spawnHero()}
          >
            $Spawn Hero
          </button>
        )}
        <button
          className="btn btn-success border"
          onClick={async (event) => {
            event.preventDefault();
            if (!host) return;
            const moves = getComponentValue(Moves, SOURCE)?.value;
            if (!moves || moves.length === 0) return;
            await move(host, moves);
          }}
        >
          $Move
        </button>
      </div>
    </div>
  );
};

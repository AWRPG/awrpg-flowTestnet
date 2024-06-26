import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import useSyncComputedComponents from "./hooks/useSyncComputedComponents";
import useHotkeys from "./hooks/useHotKeys";
import { getComponentValue } from "@latticexyz/recs";
import { SOURCE } from "./constants";

export const App = () => {
  useSyncComputedComponents();
  useHotkeys();
  const {
    components: { Counter, Moves },
    systemCalls: { move },
  } = useMUD();

  const counter = useComponentValue(Counter, singletonEntity);

  return (
    <div className="absolute h-full w-full text-white">
      <div className="">
        Counter: <span>{counter?.value ?? "??"}</span>
      </div>
      <button
        className="btn btn-success border"
        onClick={async (event) => {
          event.preventDefault();
          const moves = getComponentValue(Moves, SOURCE)?.value;
          console.log(moves);
          if (!moves || moves.length === 0) return;
          await move(moves);
        }}
      >
        $Move
      </button>
    </div>
  );
};

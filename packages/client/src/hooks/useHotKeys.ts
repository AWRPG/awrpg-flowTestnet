import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import {
  Entity,
  Has,
  HasValue,
  getComponentValue,
  removeComponent,
  runQuery,
  setComponent,
} from "@latticexyz/recs";
import { useEffect } from "react";
import { useMUD } from "../MUDContext";
import { SOURCE } from "../constants";
import { Direction, updateMoves } from "../logics/move";
import { TEST } from "../contract/constants";

export default function useHotkeys() {
  const {
    components,
    network: { playerEntity },
    systemCalls,
  } = useMUD();
  const { Position, Commander, Moves, SelectedHost } = components;
  const ownedHosts = useEntityQuery([
    HasValue(Commander, { value: playerEntity }),
  ]);
  const moves = useComponentValue(Moves, SOURCE)?.value ?? [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == "w") {
        updateMoves(components, systemCalls, Direction.UP);
      } else if (e.key == "s") {
        updateMoves(components, systemCalls, Direction.DOWN);
      } else if (e.key == "a") {
        updateMoves(components, systemCalls, Direction.LEFT);
      } else if (e.key == "d") {
        updateMoves(components, systemCalls, Direction.RIGHT);
      } else if (e.key == "Shift") {
        setComponent(SelectedHost, SOURCE, { value: TEST as Entity });
      } else if (e.key == "Enter") {
        console.log("Enter");
      } else if (/[0-9]/.test(e.key)) {
        const index = (Number(e.key) + 9) % 10;
        const host = ownedHosts[index];
        // if (host) {
        //   setComponent(SelectedHost, SOURCE, {
        //     value: host,
        //   });
        // }
      } else if (e.key == "Escape") {
        return;
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [ownedHosts]);
}

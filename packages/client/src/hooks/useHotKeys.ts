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
import { Direction, combine, split, validMovesForHost } from "../logics/move";
import { ClientComponents } from "../mud/createClientComponents";
import { SystemCalls } from "../mud/createSystemCalls";

export const oppositeDirection = (d1: Direction, d2: Direction) => {
  return d1 + d2 === 1 || d1 + d2 === 5;
};

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

export const updateMoves = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  direction: Direction
) => {
  const { Moves, SelectedHost } = components;
  // there must be a selected host for it to start moving
  const source = getComponentValue(SelectedHost, SOURCE)?.value;
  if (!source) return;
  const moves = getComponentValue(Moves, SOURCE)?.value ?? [];
  let newMoves = [...moves];
  if (moves.length === 0) {
    newMoves = [direction as number];
  } else {
    const lastMove = moves[moves.length - 1];
    if (oppositeDirection(lastMove, direction)) {
      newMoves.pop();
    } else {
      newMoves.push(direction as number);
    }
  }
  const validMoves = validMovesForHost(
    components,
    systemCalls,
    source,
    newMoves
  );
  if (!validMoves || validMoves.length === 0)
    return removeComponent(Moves, SOURCE);
  console.log("newMoves", newMoves, validMoves);
  setComponent(Moves, SOURCE, { value: validMoves });
};

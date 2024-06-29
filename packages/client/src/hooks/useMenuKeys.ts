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
import { MAIN_MENU, MENU, SOURCE } from "../constants";
import { Direction, updateMoves } from "../logics/move";

export type MenuKeysProps = {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onA?: (selected: number) => void;
  onB?: (selected: number) => void;
  selected?: number;
};

export default function useMenuKeys({
  onUp,
  onDown,
  onLeft,
  onRight,
  onA,
  onB,
  selected = 0,
}: MenuKeysProps) {
  const {
    components,
    network: { playerEntity },
    systemCalls,
  } = useMUD();
  const { SelectedEntity, Commander, Moves, SelectedHost } = components;
  const menu = useComponentValue(SelectedEntity, MENU)?.value;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == "w") {
        return onUp?.();
      } else if (e.key == "s") {
        return onDown?.();
      } else if (e.key == "a") {
        return onLeft?.();
      } else if (e.key == "d") {
        return onRight?.();
      } else if (e.key == "j") {
        console.log("onA", selected);
        return onA?.(selected);
      } else if (e.key == "k") {
        return onB?.(selected);
      }
    };
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [menu, selected]);
}

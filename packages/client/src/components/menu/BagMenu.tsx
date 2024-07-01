import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "../../MUDContext";
import { ERC20_TYPES, MAIN_MENU, MENU, SOURCE } from "../../constants";
import { getBalanceEntity, getERC20Balance } from "../../logics/container";
import { Hex, hexToString } from "viem";
import { Entity, setComponent } from "@latticexyz/recs";
import ItemContainer from "../ItemContainer";
import { useState } from "react";
import useMenuKeys from "../../hooks/useMenuKeys";

export default function BagMenu() {
  const { components } = useMUD();
  const { SelectedHost, SelectedEntity } = components;
  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value as Entity;

  const erc20sData = ERC20_TYPES.map((erc20Type) => {
    const balance = getERC20Balance(components, sourceHost as Hex, erc20Type);
    return {
      erc20Type,
      balance,
    };
  });

  const selections = erc20sData.map(({ erc20Type, balance }) => {
    return {
      content: (
        <div className="flex flex-row justify-between">
          <span>{hexToString(erc20Type)}</span>
          <span>x{Number(balance)}</span>
        </div>
      ),
      onClick: () => {
        console.log("erc20Type", erc20Type);
      },
    };
  });

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
    onB: () => setComponent(SelectedEntity, MENU, { value: MAIN_MENU }),
    selected,
  });

  return (
    <div className="flex flex-col w-auto space-y-4 border p-1 bg-gray-500 text-white pointer-events-auto">
      {selections.map(({ content, onClick }, index) => (
        <ItemContainer
          key={index}
          className="btn btn-success border"
          onClick={onClick}
          selected={selected === index}
        >
          {content}
        </ItemContainer>
      ))}
    </div>
  );
}

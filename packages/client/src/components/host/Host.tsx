import { Entity } from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import { isBuilding } from "../../logics/entity";
import { Building } from "../building/Building";
import { Role } from "./Role";
import { useState } from "react";
import { useComponentValue } from "@latticexyz/react";
import { SOURCE } from "../../constants";
import { Transfer } from "../building/Transfer";

/**
 * display a host, either a building or a role
 */
export function Host({ host }: { host: Entity }) {
  const { components } = useMUD();
  const { SelectedHost } = components;
  const sourceHost = useComponentValue(SelectedHost, SOURCE)?.value as Entity;
  const buildingType = isBuilding(components, host);
  // switch between transfer from sourceHost or to sourceHost
  const [toTransfer, setToTransfer] = useState(true);

  return (
    <>
      {buildingType ? <Building building={host} /> : <Role role={host} />}
      {sourceHost && host !== sourceHost && (
        <>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
            onClick={() => setToTransfer(!toTransfer)}
          >
            {toTransfer ? "Switch Transfer" : "Switch Transfer"}
          </button>
          {toTransfer && <Transfer fromHost={sourceHost} toHost={host} />}
          {!toTransfer && <Transfer fromHost={host} toHost={sourceHost} />}
        </>
      )}
    </>
  );
}

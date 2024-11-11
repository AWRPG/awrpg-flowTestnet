import { Entity } from "@latticexyz/recs";
import { useMUD } from "../../MUDContext";
import { Hex, hexToBigInt } from "viem";
import { splitFromEntity } from "../../logics/move";
import { getBurnCosts, hasBurnCosts } from "../../logics/cost";
import {
  getSelectedTerrainData,
  getTargetTerrainData,
} from "../../logics/terrain";
import { terrainTypeMapping } from "../../constants";
import { fromEntity, hexTypeToString } from "../../utils/encode";
import { getCanPickupRange } from "../../logics/drop";

export function BurnTerrain({ tile, host }: { tile: Entity; host: Entity }) {
  const { components, systemCalls } = useMUD();
  const { burnTerrain } = systemCalls;

  const tileCoord = splitFromEntity(tile);

  const terrainData = getTargetTerrainData(components, systemCalls);
  if (!terrainData) return null;
  const terrainType = terrainTypeMapping[terrainData.terrainType];
  const costs = getBurnCosts(components, terrainType) as Hex[];
  if (!costs || costs.length === 0) return null;
  const hasCosts = hasBurnCosts(components, host as Hex, terrainType);
  const inBurnRange = getCanPickupRange(components, host, tile);
  console.log("burnData", costs, inBurnRange, hasCosts);

  return (
    <div className="text-sm">
      <Costs costs={costs} />
      <div>Has Cost: {hasCosts ? "true" : "false"}</div>
      <div>In Range: {inBurnRange ? "true" : "false"}</div>
      <button
        className="btn-blue"
        disabled={!hasCosts || !inBurnRange}
        onClick={() => burnTerrain(host as Hex, tileCoord)}
      >
        burn {hexTypeToString(terrainType)}
      </button>
    </div>
  );
}

export const Costs = ({ costs }: { costs: Hex[] }) => {
  return (
    <div>
      {costs.map((cost, index) => {
        const { type, id } = fromEntity(cost);
        return (
          <div key={index}>
            <div>
              Cost: {Number(id)} {hexTypeToString(type)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

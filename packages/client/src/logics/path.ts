import { Hex } from "viem";
import { ClientComponents } from "../mud/createClientComponents";
import { getComponentValue, Entity } from "@latticexyz/recs";
import { unixTimeSecond } from "../utils/time";

//
export const getReadyPosition = (
  components: ClientComponents,
  host: Entity
) => {
  const path = getComponentValue(components.Path, host);
  console.log("getReadyPosition", path);
  if (!path) return;
  if (path.lastUpdated + path.duration > unixTimeSecond()) return;
  // if (path!.lastUpdated ?? 0 > unixTimeSecond()) return;
  return { x: path?.toTileX, y: path?.toTileY };
};

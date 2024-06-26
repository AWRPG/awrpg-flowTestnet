/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { Entity, getComponentValue, removeComponent } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { PERLIN_DENOM, TEST } from "../contract/constants";
import { Hex } from "viem";
import { SOURCE } from "../constants";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { worldContract, waitForTransaction, perlin }: SetupNetworkResult,
  components: ClientComponents
) {
  const { Counter, Moves } = components;

  const getNoise = (x: number, y: number) => {
    const noise = perlin(x, y, 0, PERLIN_DENOM);
    return Math.floor(noise * 100);
  };

  const move = async (moves: number[]) => {
    const tx = await worldContract.write.move([TEST, moves]);
    await waitForTransaction(tx);
    removeComponent(Moves, SOURCE);
  };

  return {
    getNoise,
    move,
  };
}

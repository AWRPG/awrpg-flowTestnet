/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { Entity, getComponentValue, removeComponent } from "@latticexyz/recs";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { PERLIN_DENOM } from "../contract/constants";
import { Hex } from "viem";
import { SOURCE } from "../constants";
import { Vector } from "../utils/vector";

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
  const { Moves } = components;

  const getNoise = (x: number, y: number) => {
    const noise = perlin(x, y, 0, PERLIN_DENOM);
    return Math.floor(noise * 100);
  };

  const spawnHero = async () => {
    const tx = await worldContract.write.spawnHero();
    await waitForTransaction(tx);
  };

  const move = async (host: Hex, moves: number[]) => {
    const tx = await worldContract.write.move([host, moves]);
    await waitForTransaction(tx);
    // try {
    //   const tx = await worldContract.write.move([TEST, moves]);
    // } catch (error) {
    //   console.error("Transaction failed:", error);
    // }
    removeComponent(Moves, host as Entity);
  };

  const burnTerrain = async (host: Hex, coord: Vector) => {
    const tx = await worldContract.write.burnTerrain([host, coord.x, coord.y]);
    await waitForTransaction(tx);
  };

  const interactTerrain = async (host: Hex, coord: Vector) => {
    const tx = await worldContract.write.interactTerrain([
      host,
      coord.x,
      coord.y,
    ]);
    await waitForTransaction(tx);
  };

  const buildBuilding = async (host: Hex, buildingType: Hex, coord: Vector) => {
    const tx = await worldContract.write.buildBuilding([
      host,
      buildingType,
      coord.x,
      coord.y,
    ]);
    await waitForTransaction(tx);
  };

  return {
    getNoise,
    spawnHero,
    move,
    burnTerrain,
    interactTerrain,
    buildBuilding,
  };
}

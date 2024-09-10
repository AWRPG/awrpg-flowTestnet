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
import { selectNextHost } from "../logics/entity";

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
  {
    worldContract,
    waitForTransaction,
    perlin,
    playerEntity,
  }: SetupNetworkResult,
  components: ClientComponents
) {
  const { Moves } = components;

  const getNoise = (x: number, y: number, perlin_denom?: number) => {
    perlin_denom = perlin_denom ?? PERLIN_DENOM;
    const noise = perlin(x, y, 0, perlin_denom);
    return Math.floor(noise * 100);
  };

  const spawnHero = async () => {
    const tx = await worldContract.write.spawnHero();
    await waitForTransaction(tx);
    selectNextHost(components, playerEntity);
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

  const buildBuilding = async (
    host: Hex,
    buildingType: Hex,
    coord: Vector,
    lowerCoord: Vector
  ) => {
    const tx = await worldContract.write.buildBuilding([
      host,
      buildingType,
      coord.x,
      coord.y,
      lowerCoord.x,
      lowerCoord.y,
    ]);
    await waitForTransaction(tx);
  };

  const consumeERC20 = async (host: Hex, itemType: Hex) => {
    const tx = await worldContract.write.consumeERC20([itemType, host]);
    await waitForTransaction(tx);
  };

  const transferERC20 = async (
    from: Hex,
    to: Hex,
    itemType: Hex,
    amount: bigint
  ) => {
    const tx = await worldContract.write.transferERC20([
      itemType,
      from,
      to,
      amount,
    ]);
    await waitForTransaction(tx);
  };

  const setSwapRatio = async (
    fromType: Hex,
    toType: Hex,
    host: Hex,
    num: number,
    denom: number
  ) => {
    const tx = await worldContract.write.setSwapRatio([
      fromType,
      toType,
      host,
      num,
      denom,
    ]);
    await waitForTransaction(tx);
  };

  const swapERC20 = async (
    fromType: Hex,
    toType: Hex,
    from: Hex,
    to: Hex,
    amount: bigint
  ) => {
    const tx = await worldContract.write.swapERC20([
      fromType,
      toType,
      from,
      to,
      amount,
    ]);
    await waitForTransaction(tx);
  };

  const setTerrainValues = async (gridCoord: Vector, values: bigint) => {
    console.log("setTerrainValues", gridCoord, values);
    const tx = await worldContract.write.setTerrainValues([
      gridCoord.x,
      gridCoord.y,
      values,
    ]);
    await waitForTransaction(tx);
  };

  const setTerrainValue = async (tileCoord: Vector, value: number) => {
    const tx = await worldContract.write.setTerrainValue([
      tileCoord.x,
      tileCoord.y,
      value,
    ]);
    await waitForTransaction(tx);
  };

  const enterBuilding = async (role: Hex, enterCoord: Vector) => {
    const tx = await worldContract.write.enterBuilding([
      role,
      enterCoord.x,
      enterCoord.y,
    ]);
    await waitForTransaction(tx);
  };

  const exitBuilding = async (
    role: Hex,
    buildingCoord: Vector,
    exitCoord: Vector
  ) => {
    const tx = await worldContract.write.exitBuilding([
      role,
      buildingCoord.x,
      buildingCoord.y,
      exitCoord.x,
      exitCoord.y,
    ]);
    await waitForTransaction(tx);
  };

  const startMining = async (role: Hex, buildingCoord: Vector) => {
    const tx = await worldContract.write.startMining([
      role,
      buildingCoord.x,
      buildingCoord.y,
    ]);
    await waitForTransaction(tx);
  };

  const stopMining = async (role: Hex) => {
    const tx = await worldContract.write.stopMining([role]);
    await waitForTransaction(tx);
  };

  const attack = async (attacker: Hex, target: Hex) => {
    const tx = await worldContract.write.attack([attacker, target]);
    await waitForTransaction(tx);
  };

  const dropERC20 = async (role: Hex, itemType: Hex, amount: bigint) => {
    const tx = await worldContract.write.dropERC20([role, itemType, amount]);
    await waitForTransaction(tx);
  };

  const pickupERC20 = async (
    role: Hex,
    from: Hex,
    itemType: Hex,
    amount: bigint,
    tileX: number,
    tileY: number
  ) => {
    const tx = await worldContract.write.pickupERC20([
      role,
      from,
      itemType,
      amount,
      tileX,
      tileY,
    ]);
    await waitForTransaction(tx);
  };

  const dropERC721 = async (entity: Hex) => {
    const tx = await worldContract.write.dropERC721([entity]);
    await waitForTransaction(tx);
  };

  const pickupERC721 = async (
    role: Hex,
    from: Hex,
    entity: Hex,
    tileX: number,
    tileY: number
  ) => {
    const tx = await worldContract.write.pickupERC721([
      role,
      from,
      entity,
      tileX,
      tileY,
    ]);
    await waitForTransaction(tx);
  };

  const stake = async (role: Hex, stakeType: Hex, coord: Vector) => {
    const tx = await worldContract.write.stake([
      role,
      stakeType,
      coord.x,
      coord.y,
    ]);
    await waitForTransaction(tx);
  };

  const unstake = async (role: Hex, coord: Vector) => {
    const tx = await worldContract.write.unstake([role, coord.x, coord.y]);
    await waitForTransaction(tx);
  };

  const claim = async (role: Hex, coord: Vector) => {
    const tx = await worldContract.write.claim([role, coord.x, coord.y]);
    await waitForTransaction(tx);
  };

  return {
    getNoise,
    spawnHero,
    move,
    burnTerrain,
    interactTerrain,
    buildBuilding,
    consumeERC20,
    transferERC20,
    setSwapRatio,
    swapERC20,
    setTerrainValues,
    setTerrainValue,
    enterBuilding,
    exitBuilding,
    startMining,
    stopMining,
    attack,
    dropERC20,
    pickupERC20,
    dropERC721,
    pickupERC721,
    stake,
    unstake,
    claim,
  };
}

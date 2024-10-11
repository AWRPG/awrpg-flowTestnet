import { Component, Entity, Metadata } from "@latticexyz/recs";
import { ClientComponents } from "../mud/createClientComponents";
import { Hex } from "viem";
import { usePoolAmount, useRolePoolInfo } from "./pool";
import { BLOOD, STAMINA, SOUL } from "../contract/constants";

/**
 * note1: idealy, should've load poolTypes from StatsSpecs.maxPools, but use hook cannot put in loop; thus, for simplicity, call each poolInfo separately;
 * note2: in phaser, can treat each pool as separate ui components, each subscribe to Balance component with the process described by "useRolePoolInfo"
 * note3: two tables are subject to change/updated: 1) StatsSpecs table (when player updates his role type), 2) Balance tables when pool amount changes
 */
export const useRolePoolsInfo = (
  components: ClientComponents,
  role: Entity
) => {
  const staminaInfo = useRolePoolInfo(components, role, STAMINA);
  const bloodInfo = useRolePoolInfo(components, role, BLOOD);
  const soulInfo = useRolePoolInfo(components, role, SOUL);
  const poolsInfo = [staminaInfo, bloodInfo, soulInfo];
  return poolsInfo.filter((info) => info !== undefined);
};

export const useRoleInfo = (components: ClientComponents, role: Entity) => {};

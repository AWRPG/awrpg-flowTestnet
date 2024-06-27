// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "@/codegen/world/IWorld.sol";
import { LibUtils } from "../utils/LibUtils.sol";
import { DefineTypes } from "./DefineTypes.sol";
import { LibUtils } from "../utils/LibUtils.sol";
import { TypeCast } from "../utils/TypeCast.sol";
import "@/constants.sol";
import "@/hashes.sol";
import "@/codegen/index.sol";

// function initializeERC20s(address world) {
// 	Resource spice = new Resource(world, "SPICE", "SPICE");
// 	TokenAddress.set(SPICE, address(spice));
// 	// TODO: add more ERC20s
// 	Resource crystal = new Resource(world, "CRYSTAL", "CRYSTAL");
// 	TokenAddress.set(CRYSTAL, address(crystal));
// }

function initializeTypes() {
  // initConstants();
  initTerrainTypes();
  initPoolTypes();
}

function initTerrainTypes() {
  DefineTypes.defineTerrain(ROCK, TerrainSpecsData({ canMove: true, awardType: 0, awardAmount: 0 }));
  DefineTypes.defineTerrain(WATER, TerrainSpecsData({ canMove: false, awardType: 0, awardAmount: 0 }));
  DefineTypes.defineTerrain(GRASS, TerrainSpecsData({ canMove: true, awardType: 0, awardAmount: 0 }));
  DefineTypes.defineTerrain(BUSH, TerrainSpecsData({ canMove: true, awardType: 0, awardAmount: 0 }));
  DefineTypes.defineTerrain(TREE, TerrainSpecsData({ canMove: false, awardType: 0, awardAmount: 0 }));
  DefineTypes.defineTerrain(RED_MINE, TerrainSpecsData({ canMove: true, awardType: 0, awardAmount: 0 }));
}

function initPoolTypes() {
  DefineTypes.definePool(POOL, 1000);
}

// function initConstants() {
// 	Constant.set(SPAWN_AMOUNT, 15);
// 	Constant.set(SPAWN_COOLDOWN, 60);
// 	Constant.set(MINER_COOLDOWN, 60);
// 	Constant.set(MINER_DEFENCE, attack_module_m);
// 	Constant.set(MINER_HEALTH, health_module_l);
// 	Constant.set(DEFEAT_COOLDOWN, 60);
// 	Constant.set(INVINCIBLE_DURATION, 1200);
// 	Constant.set(WARP_SPEED, GRID_SIZE * 10);
// 	Constant.set(RETREAT_SPEED, GRID_SIZE * 20);
// }

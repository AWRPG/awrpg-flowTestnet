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

function initializeTypes() {
  // initConstants();
  initPoolStatsTypes();
  initTerrainTypes();
  // initPoolTypes();
  initBuildingTypes();
  initConvertRatios();
  initHostTypes();
  initERC20Sizes();
  initERC20BurnAwards();
  initCookTypes();
  initStakeTypes();
  initEntitySizes();
}

function initEntitySizes() {
  SizeSpecs.set(SWORD, 200);
}

// role, building, equipment, or any nft can has pool stats
function initPoolStatsTypes() {
  DefineTypes.definePoolStats(
    HOST,
    complieSixTypes(BLOOD, SOUL, STAMINA, ATTACK, DEFENSE, RANGE, 1000, 1000, 1000, 100, 100, 4)
  );
  DefineTypes.definePoolStats(SWORD, compileTwoTypes(ATTACK, RANGE, 10, 5));
}

// host means has capacity & size
function initHostTypes() {
  DefineTypes.defineHost(HOST, 1000, 1200);
  DefineTypes.defineHost(DROP, type(uint256).max, type(uint128).max);
  DefineTypes.defineHost(MINER, 1000 * 5, 1200 * 5);
  DefineTypes.defineHost(CAULDRON, 1000, 1200);
  DefineTypes.defineHost(FIELD, 1000, 1200);
  DefineTypes.defineHost(SAFE, 1000 * 5, 1200 * 5);
  DefineTypes.defineHost(FOUNDRY, 1000, 1200);
}

function initCookTypes() {
  DefineTypes.defineCook(
    SWORD,
    CookSpecsData({
      buildingType: CAULDRON,
      timeCost: 60,
      inputs: compileTwoTypes(STAMINA, BERRY, 10, 10),
      outputs: compileOneType(SWORD, 0)
    })
  );
}

function initStakeTypes() {
  DefineTypes.defineStake(
    WOOD,
    StakeSpecsData({
      buildingType: FIELD,
      timeCost: 60,
      inputs: compileTwoTypes(STAMINA, BERRY, 10, 1),
      outputs: compileTwoTypes(WOOD, BERRY, 10, 20)
    })
  );
  DefineTypes.defineStake(
    MEAT,
    StakeSpecsData({
      buildingType: FIELD,
      timeCost: 60,
      inputs: compileTwoTypes(STAMINA, RED, 10, 1),
      outputs: compileTwoTypes(WOOD, MEAT, 10, 20)
    })
  );
}

function initTerrainTypes() {
  bytes32[] memory empty = new bytes32[](0);
  DefineTypes.defineTerrain(PLAIN, TerrainSpecsData({ canMove: true, canBurn: false }), empty, empty, empty, empty);
  DefineTypes.defineTerrain(
    OCEAN,
    TerrainSpecsData({ canMove: false, canBurn: false }),
    compileOneType(STAMINA, 200),
    compileOneType(FISH, 1),
    empty,
    empty
  );
  DefineTypes.defineTerrain(
    FOREST,
    TerrainSpecsData({ canMove: false, canBurn: true }),
    empty,
    empty,
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 20)
  );
  DefineTypes.defineTerrain(
    MOUNTAIN,
    TerrainSpecsData({ canMove: false, canBurn: false }),
    compileOneType(STAMINA, 100),
    compileOneType(RED, 1),
    empty,
    empty
  );
}

function initBuildingTypes() {
  DefineTypes.defineBuilding(
    MINER,
    BuildingSpecsData({ width: 2, height: 2, canMove: true, terrainType: PLAIN }),
    compileTwoTypes(STAMINA, WOOD, 0, 0),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  DefineTypes.defineBuilding(
    CAULDRON,
    BuildingSpecsData({ width: 1, height: 1, canMove: false, terrainType: PLAIN }),
    compileTwoTypes(STAMINA, WOOD, 0, 0),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  DefineTypes.defineBuilding(
    FIELD,
    BuildingSpecsData({ width: 3, height: 1, canMove: true, terrainType: PLAIN }),
    compileTwoTypes(STAMINA, WOOD, 0, 0),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  DefineTypes.defineBuilding(
    BRIDGE,
    BuildingSpecsData({ width: 1, height: 1, canMove: true, terrainType: OCEAN }),
    compileTwoTypes(STAMINA, BLOOD, 0, 0),
    compileOneType(STAMINA, 100),
    compileOneType(BLOOD, 1)
  );
  DefineTypes.defineBuilding(
    SAFE,
    BuildingSpecsData({ width: 2, height: 2, canMove: true, terrainType: PLAIN }),
    compileTwoTypes(STAMINA, WOOD, 0, 0),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  DefineTypes.defineBuilding(
    FENCE,
    BuildingSpecsData({ width: 1, height: 1, canMove: false, terrainType: GRASS }),
    compileTwoTypes(STAMINA, WOOD, 20, 5),
    compileOneType(STAMINA, 50),
    compileOneType(WOOD, 1)
  );
  DefineTypes.defineBuilding(
    NODE,
    BuildingSpecsData({ width: 1, height: 1, canMove: false, terrainType: GRASS }),
    compileTwoTypes(STAMINA, WOOD, 60, 8),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  DefineTypes.defineBuilding(
    FOUNDRY,
    BuildingSpecsData({ width: 1, height: 1, canMove: false, terrainType: GRASS }),
    compileTwoTypes(STAMINA, WOOD, 80, 9),
    compileOneType(STAMINA, 100),
    compileOneType(WOOD, 4)
  );
  // TODO: add more building types
}

function initConvertRatios() {
  DefineTypes.defineConvertRatio(STAMINA, BLOOD, 1, 1);
  DefineTypes.defineConvertRatio(STAMINA, SOUL, 1, 1);
}

// function initPoolTypes() {
//   DefineTypes.definePool(POOL, 1000);
// }

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

// function initializeERC20s(address world) {
// 	Resource spice = new Resource(world, "SPICE", "SPICE");
// 	TokenAddress.set(SPICE, address(spice));
// 	// TODO: add more ERC20s
// 	Resource crystal = new Resource(world, "CRYSTAL", "CRYSTAL");
// 	TokenAddress.set(CRYSTAL, address(crystal));
// }

function initERC20Sizes() {
  SizeSpecs.set(STAMINA, 1);
  SizeSpecs.set(BLOOD, 1);
  SizeSpecs.set(SOUL, 1);
  SizeSpecs.set(WOOD, 1);
  SizeSpecs.set(BERRY, 1);
  SizeSpecs.set(FISH, 1);
  SizeSpecs.set(RED, 1);
}

function initERC20BurnAwards() {
  BurnAwards.set(BERRY, compileOneType(STAMINA, 200));
  BurnAwards.set(FISH, compileOneType(STAMINA, 300));
  BurnAwards.set(RED, compileOneType(BLOOD, 100));
}

function compileOneType(bytes16 erc20Type, uint128 amount) returns (bytes32[] memory inputs) {
  bytes16[] memory types = new bytes16[](1);
  uint128[] memory amounts = new uint128[](1);
  types[0] = erc20Type;
  amounts[0] = amount;
  inputs = LibUtils.compileCosts(types, amounts);
}

function compileTwoTypes(
  bytes16 erc20Type1,
  bytes16 erc20Type2,
  uint128 amount1,
  uint128 amount2
) returns (bytes32[] memory inputs) {
  bytes16[] memory types = new bytes16[](2);
  uint128[] memory amounts = new uint128[](2);
  types[0] = erc20Type1;
  types[1] = erc20Type2;
  amounts[0] = amount1;
  amounts[1] = amount2;
  inputs = LibUtils.compileCosts(types, amounts);
}

function compileThreeTypes(
  bytes16 erc20Type1,
  bytes16 erc20Type2,
  bytes16 erc20Type3,
  uint128 amount1,
  uint128 amount2,
  uint128 amount3
) pure returns (bytes32[] memory inputs) {
  bytes16[] memory types = new bytes16[](3);
  uint128[] memory amounts = new uint128[](3);
  types[0] = erc20Type1;
  types[1] = erc20Type2;
  types[2] = erc20Type3;
  amounts[0] = amount1;
  amounts[1] = amount2;
  amounts[2] = amount3;
  inputs = LibUtils.compileCosts(types, amounts);
}

function complieSixTypes(
  bytes16 erc20Type1,
  bytes16 erc20Type2,
  bytes16 erc20Type3,
  bytes16 erc20Type4,
  bytes16 erc20Type5,
  bytes16 erc20Type6,
  uint128 amount1,
  uint128 amount2,
  uint128 amount3,
  uint128 amount4,
  uint128 amount5,
  uint128 amount6
) pure returns (bytes32[] memory inputs) {
  bytes16[] memory types = new bytes16[](6);
  uint128[] memory amounts = new uint128[](6);
  types[0] = erc20Type1;
  types[1] = erc20Type2;
  types[2] = erc20Type3;
  types[3] = erc20Type4;
  types[4] = erc20Type5;
  types[5] = erc20Type6;
  amounts[0] = amount1;
  amounts[1] = amount2;
  amounts[2] = amount3;
  amounts[3] = amount4;
  amounts[4] = amount5;
  amounts[5] = amount6;
  inputs = LibUtils.compileCosts(types, amounts);
}

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
  initTerrainTypes();
  initPoolTypes();
  initBuildingTypes();
  initConvertRatios();
}

function initTerrainTypes() {
  bytes32[] memory empty = new bytes32[](0);
  DefineTypes.defineTerrain(ROCK, TerrainSpecsData({ canMove: true, canBurn: false }), empty, empty, empty, empty);
  DefineTypes.defineTerrain(GRASS, TerrainSpecsData({ canMove: true, canBurn: false }), empty, empty, empty, empty);
  DefineTypes.defineTerrain(
    WATER,
    TerrainSpecsData({ canMove: false, canBurn: false }),
    compileOneType(STAMINA, 5),
    compileOneType(FISH, 1),
    empty,
    empty
  );
  DefineTypes.defineTerrain(
    BUSH,
    TerrainSpecsData({ canMove: true, canBurn: false }),
    compileOneType(STAMINA, 5),
    compileOneType(BERRY, 1),
    empty,
    empty
  );
  DefineTypes.defineTerrain(
    TREE,
    TerrainSpecsData({ canMove: false, canBurn: false }),
    empty,
    empty,
    compileOneType(STAMINA, 20),
    compileOneType(WOOD, 1)
  );
  DefineTypes.defineTerrain(
    RED_MINE,
    TerrainSpecsData({ canMove: true, canBurn: false }),
    compileOneType(STAMINA, 5),
    compileOneType(RED, 1),
    empty,
    empty
  );
}

function initBuildingTypes() {
  DefineTypes.defineBuilding(
    SAFE,
    BuildingSpecsData({ canMove: false, terrainType: GRASS }),
    compileTwoTypes(STAMINA, WOOD, 10, 10),
    compileOneType(STAMINA, 5),
    compileOneType(WOOD, 2)
  );
  // TODO: add more building types
}

function initConvertRatios() {
  DefineTypes.defineConvertRatio(STAMINA, BLOOD, 1, 1);
  DefineTypes.defineConvertRatio(STAMINA, SOUL, 1, 1);
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

// function initializeERC20s(address world) {
// 	Resource spice = new Resource(world, "SPICE", "SPICE");
// 	TokenAddress.set(SPICE, address(spice));
// 	// TODO: add more ERC20s
// 	Resource crystal = new Resource(world, "CRYSTAL", "CRYSTAL");
// 	TokenAddress.set(CRYSTAL, address(crystal));
// }

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

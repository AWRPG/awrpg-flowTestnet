// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { MiningInfo, TileEntity, EntityType, Owner } from "@/codegen/index.sol";
import { AwardLogic } from "./AwardLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { Perlin } from "../utils/Perlin.sol";
import { random } from "../utils/random.sol";
import { BuildingLogic } from "./BuildingLogic.sol";
import { ContainerLogic } from "./ContainerLogic.sol";
import { ERC721Logic } from "./ERC721Logic.sol";
import { CostLogic } from "./CostLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

library MiningLogic {
  function getPerlin(uint32 x, uint32 y) internal pure returns (uint8) {
    int128 noise = Perlin.noise2d(int40(uint40(x)), int40(uint40(y)), int8(PERLIN_DENOM_MINE), 64);

    uint8 precision = 2;
    uint256 denominator = 10 ** precision;

    uint256 noise1 = (uint256(uint128(noise)) * denominator) >> 64;
    return uint8(noise1);
  }

  function hasMine(uint32 tileX, uint32 tileY) internal pure returns (bool) {
    uint32 x = tileX / GRID_SIZE_MINE;
    uint32 y = tileY / GRID_SIZE_MINE;
    bytes32 coordId = MapLogic.getCoordId(x, y);
    uint8 perlin = getPerlin(x, y);
    return perlin >= DOWN_LIMIT_MINE && perlin <= UP_LIMIT_MINE && random(uint256(coordId), 100) <= PERCENTAGE_MINE;
  }

  // function _buildMiner(bytes32 player, bytes32 role, uint32 x1, uint32 y1, uint32 lowerX, uint32 lowerY) internal {
  //   if (!hasMine(lowerX, lowerY)) revert Errors.NoMine();
  //   BuildingLogic._buildBuilding(player, role, MINER, x1, y1, lowerX, lowerY);
  // }

  // TODO: add mining tools, transfer it to custodian,
  function _startMining(bytes32 role, uint32 x, uint32 y) internal {
    if (!hasMine(x, y)) revert Errors.NoMine();
    bytes32 tileId = MapLogic.getCoordId(x, y);
    bytes32 building = TileEntity.get(tileId);
    if (EntityType.get(building) != MINER) revert Errors.BuildingNotMiner();

    ERC721Logic._transfer(building, getCustodian(building), role);
    // add cooldown?
    MiningInfo.set(role, building, uint40(block.timestamp));
  }

  function _stopMining(bytes32 role) internal {
    bytes32 building = MiningInfo.getBuildingId(role);
    uint40 lastUpdated = MiningInfo.getLastUpdated(role);
    // no need to delete mining info because custodian ensures no double mining
    // do some calculation
    uint128 amount = 20;
    ContainerLogic._mint(BERRY, role, amount);
    ERC721Logic._transfer(getCustodian(building), building, role);
  }
}

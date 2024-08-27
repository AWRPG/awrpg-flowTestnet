// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TerrainSpecs, RemovedCoord, TileEntity, EntityType, Path } from "@/codegen/index.sol";
import { TerrainLogic } from "@/libraries/TerrainLogic.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { BuildingLogic } from "@/libraries/BuildingLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

uint8 constant PERLIN_DENOM = 6;

library MapLogic {
  // in use by TerrainLogic
  function getCoordId(uint32 x, uint32 y) internal pure returns (bytes32) {
    return bytes32((uint256(x) << 128) | uint256(y));
  }

  // in use by TerrainLogic
  function splitCoordId(bytes32 coordId) internal pure returns (uint32 x, uint32 y) {
    x = uint32(uint256(coordId) >> 128);
    y = uint32(uint256(coordId));
  }

  function _initGroundPath(bytes32 host, uint32 toX, uint32 toY) internal {
    Path.set(host, toX, toY, toX, toY, uint40(block.timestamp), 0);
    TileEntity.set(getCoordId(toX, toY), host);
  }

  function getRandomEmptyPosition(
    uint256 seed,
    uint32 minX,
    uint32 minY,
    uint32 maxX,
    uint32 maxY
  ) internal view returns (uint32 x, uint32 y) {
    (x, y) = getRandomPosition(seed, minX, minY, maxX, maxY);
    while (TileEntity.get(getCoordId(x, y)) != 0 || !TerrainLogic.canMoveToTerrain(bytes32(seed), x, y)) {
      seed += 1;
      (x, y) = getRandomPosition(seed, minX, minY, maxX, maxY);
    }
    return (x, y);
  }

  function getRandomPosition(
    uint256 seed,
    uint32 minX,
    uint32 minY,
    uint32 maxX,
    uint32 maxY
  ) internal pure returns (uint32, uint32) {
    uint256 x = (uint256(keccak256(abi.encodePacked(seed, "x"))) % (maxX - minX)) + minX;
    uint256 y = (uint256(keccak256(abi.encodePacked(seed, "y"))) % (maxY - minY)) + minY;
    return (uint32(x), uint32(y));
  }
}

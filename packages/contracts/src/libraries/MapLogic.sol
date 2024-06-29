// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TerrainSpecs, RemovedCoord, EntityCoord, EntityType } from "@/codegen/index.sol";
import { Perlin } from "../utils/Perlin.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

uint8 constant PERLIN_DENOM = 6;

library MapLogic {
  // noise is 20~80
  function getPerlin(uint32 x, uint32 y) internal pure returns (uint8) {
    int128 noise = Perlin.noise2d(int40(uint40(x)), int40(uint40(y)), int8(PERLIN_DENOM), 64);

    uint8 precision = 2;
    uint256 denominator = 10 ** precision;

    uint256 noise1 = (uint256(uint128(noise)) * denominator) >> 64;
    return uint8(noise1);
  }

  function noiseToTerrainType(uint8 noise) internal pure returns (bytes16) {
    if (noise < 23) return ROCK;
    if (noise < 40) return WATER;
    if (noise < 55) return GRASS;
    if (noise < 65) return BUSH;
    if (noise < 78) return TREE;
    else return RED_MINE;
  }

  function getTerrainType(uint32 x, uint32 y) internal view returns (bytes16) {
    uint8 noise = getPerlin(x, y);
    bytes16 terrainType = noiseToTerrainType(noise);
    bytes32 coordId = getCoordId(x, y);
    if (RemovedCoord.get(coordId)) return GRASS;
    return terrainType;
  }

  function canMoveTo(uint32 x, uint32 y) internal view returns (bool) {
    bytes16 terrainType = getTerrainType(x, y);
    bool terrainCanMove = TerrainSpecs.getCanMove(terrainType);
    bytes32 coorId = getCoordId(x, y);
    bool hasEntity = EntityCoord.get(coorId) == 0;
    return terrainCanMove && !hasEntity;
  }

  function canMoveToStrict(uint32 x, uint32 y) internal view {
    bytes16 terrainType = getTerrainType(x, y);
    bool terrainCanMove = TerrainSpecs.getCanMove(terrainType);
    if (!terrainCanMove) revert Errors.CannotMoveToTerrain(terrainType);
    bytes32 coorId = getCoordId(x, y);
    bool hasEntity = EntityCoord.get(coorId) == 0;
    if (!hasEntity) revert Errors.CannotMoveOnEntity(coorId);
  }

  function getCoordId(uint32 x, uint32 y) internal pure returns (bytes32) {
    return bytes32((uint256(x) << 128) | uint256(y));
  }
}

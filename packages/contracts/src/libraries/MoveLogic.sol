// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TileEntity, Moves, Path, PathData } from "@/codegen/index.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { TerrainLogic } from "@/libraries/TerrainLogic.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { BuildingLogic } from "@/libraries/BuildingLogic.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

uint8 constant MAX_MOVES = 20;
uint32 constant STAMINA_COST = 10;
uint32 constant MOVE_DURATION = 300;

library MoveLogic {
  enum Direction {
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
  }

  function _move(bytes32 host, uint8[] memory moves) internal {
    // TODO: burn stamina
    // uint32 staminaCost = uint32(moves.length) * STAMINA_COST;

    (uint32 fromTileX, uint32 fromTileY) = getTileCoordStrict(host);
    (uint32 toTileX, uint32 toTileY) = canMovesStrict(host, fromTileX, fromTileY, moves);

    TileEntity.deleteRecord(MapLogic.getCoordId(fromTileX, fromTileY));
    TileEntity.set(MapLogic.getCoordId(toTileX, toTileY), host);

    Path.set(
      host,
      PathData(
        fromTileX,
        fromTileY,
        toTileX,
        toTileY,
        uint40(block.timestamp),
        uint40((moves.length * MOVE_DURATION) / 1000)
      )
    );
    Moves.set(host, combineMoves(moves));
  }

  function combineMoves(uint8[] memory moves) internal pure returns (uint256) {
    uint256 result = 0;
    for (uint256 i = 0; i < moves.length; i++) {
      result |= uint256(moves[i]) << (4 * i);
    }
    return result;
  }

  function getTileCoordStrict(bytes32 host) internal view returns (uint32 tileX, uint32 tileY) {
    if (!arrived(host)) revert Errors.NotArrived();
    tileX = Path.getToTileX(host);
    tileY = Path.getToTileY(host);
    if (!onGround(host, tileX, tileY)) revert Errors.NotOnGround();
  }

  function arrived(bytes32 host) internal view returns (bool) {
    uint40 lastUpdated = Path.getLastUpdated(host);
    uint40 duration = Path.getDuration(host);
    return lastUpdated != 0 && lastUpdated + duration <= block.timestamp;
  }

  // check if the host is on ground
  function onGround(bytes32 host, uint32 tileX, uint32 tileY) internal view returns (bool) {
    return TileEntity.get(MapLogic.getCoordId(tileX, tileY)) == host;
  }

  // // return moves with length = 20
  // function splitMoves(uint256 _moves) internal pure returns (uint8[] memory moves) {
  //   moves = new uint8[](MAX_MOVES);
  //   for (uint256 i = 0; i < MAX_MOVES; i++) {
  //     uint8 move = uint8(_moves >> (4 * i));
  //     if (move == 0) return moves;

  //     moves[i] = uint8(move);
  //   }
  //   return moves;
  // }

  function canMovesStrict(
    bytes32 host,
    uint32 fromTileX,
    uint32 fromTileY,
    uint8[] memory moves
  ) internal view returns (uint32 toX, uint32 toY) {
    if (moves.length > MAX_MOVES) revert Errors.ExceedMaxMoves();
    uint64[] memory toPositions = movesToPositions(moves, fromTileX, fromTileY);
    canMoveToPositionsStrict(host, toPositions);
    return split(toPositions[toPositions.length - 1]);
  }

  function canMoveToPositionsStrict(bytes32 host, uint64[] memory positions) internal view {
    for (uint256 i = 1; i < positions.length - 1; i++) {
      (uint32 _x, uint32 _y) = split(positions[i]);
      canMoveAcrossStrict(host, _x, _y);
    }
    (uint32 x, uint32 y) = split(positions[positions.length - 1]);
    canMoveToStrict(host, x, y);
  }

  function canMoveAcrossStrict(bytes32 host, uint32 tileX, uint32 tileY) internal view {
    if (!TerrainLogic.canMoveToTerrain(host, tileX, tileY)) revert Errors.CannotMoveToTerrain();
    bytes32 tileId = MapLogic.getCoordId(tileX, tileY);
    bytes32 tileEntity = TileEntity.get(tileId);
    // role can be moved across
    if (EntityLogic.isRole(tileEntity)) return;
    // some building can move to
    if (BuildingLogic.canMoveTo(tileEntity)) return;
    revert Errors.CannotMoveAcrossBuilding();
  }

  // Rn, cannot move to a tile coord that has an entity on, building or role
  function canMoveToStrict(bytes32 host, uint32 tileX, uint32 tileY) internal view {
    if (!TerrainLogic.canMoveToTerrain(host, tileX, tileY)) revert Errors.CannotMoveToTerrain();
    bytes32 tileId = MapLogic.getCoordId(tileX, tileY);
    bytes32 tileEntity = TileEntity.get(tileId);
    if (tileEntity != 0) revert Errors.CannotMoveOnEntity(tileId);
  }

  function movesToPositions(uint8[] memory moves, uint32 fromX, uint32 fromY) internal pure returns (uint64[] memory) {
    uint64[] memory positions = new uint64[](moves.length);
    uint32 newX = fromX;
    uint32 newY = fromY;
    for (uint256 i = 0; i < moves.length; i++) {
      positions[i] = moveToPosition(moves[i], newX, newY);
      (newX, newY) = split(positions[i]);
    }
    return positions;
  }

  function moveToPosition(uint8 move, uint32 fromX, uint32 fromY) internal pure returns (uint64) {
    if (move == uint8(Direction.UP)) {
      return combine(fromX, fromY - 1);
    } else if (move == uint8(Direction.DOWN)) {
      return combine(fromX, fromY + 1);
    } else if (move == uint8(Direction.LEFT)) {
      return combine(fromX - 1, fromY);
    } else if (move == uint8(Direction.RIGHT)) {
      return combine(fromX + 1, fromY);
    } else {
      revert Errors.InvalidMove();
    }
  }

  // combine two uint32 into one uint64
  function combine(uint32 x, uint32 y) internal pure returns (uint64) {
    return (uint64(x) << 32) | y;
  }

  // split one uint64 into two uint32
  function split(uint64 xy) internal pure returns (uint32, uint32) {
    uint32 x = uint32(xy >> 32);
    uint32 y = uint32(xy);
    return (x, y);
  }
}

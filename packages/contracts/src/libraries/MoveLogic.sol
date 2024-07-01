// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Position, PositionData, EntityCoord } from "@/codegen/index.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

uint8 constant MAX_MOVES = 20;
uint32 constant STAMINA_COST = 10;

library MoveLogic {
  enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
  }

  function _move(bytes32 host, uint8[] memory moves) internal {
    // TODO: burn stamina
    uint32 staminaCost = uint32(moves.length) * STAMINA_COST;

    (uint32 toX, uint32 toY) = canMoveStrict(host, moves);

    uint32 fromX = Position.getX(host);
    uint32 fromY = Position.getY(host);
    EntityCoord.deleteRecord(MapLogic.getCoordId(fromX, fromY));

    Position.set(host, toX, toY);
    EntityCoord.set(MapLogic.getCoordId(toX, toY), host);
  }

  function canMoveStrict(bytes32 host, uint8[] memory moves) internal view returns (uint32 toX, uint32 toY) {
    PositionData memory position = Position.get(host);
    // (uint32 fromX, uint32 fromY) = split(moves[0]);
    // if (position.x != fromX || position.y != fromY) revert Errors.NotFromHostPosition();
    // if (!isIncrementalMoves(moves)) revert Errors.NotIncrementalMoves();
    if (moves.length > MAX_MOVES) revert Errors.ExceedMaxMoves();
    uint64[] memory toPositions = movesToPositions(moves, position.x, position.y);
    canMoveToStrict(toPositions);
    return split(toPositions[toPositions.length - 1]);
  }

  function canMoveToStrict(uint64[] memory moves) internal view {
    for (uint256 i = 1; i < moves.length; i++) {
      (uint32 x, uint32 y) = split(moves[i]);
      MapLogic.canMoveToStrict(x, y);
    }
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

  function isIncrementalMoves(uint64[] memory moves) internal pure returns (bool) {
    for (uint256 i = 0; i < moves.length - 1; i++) {
      if (!isIncremental(moves[i], moves[i + 1])) {
        return false;
      }
    }
    return true;
  }

  function isIncremental(uint64 from, uint64 to) internal pure returns (bool) {
    (uint32 fromX, uint32 fromY) = split(from);
    (uint32 toX, uint32 toY) = split(to);
    if (fromX == toX) {
      return diffEqualTo1(fromY, toY);
    } else if (fromY == toY) {
      return diffEqualTo1(fromX, toX);
    } else {
      return false;
    }
  }

  function diffEqualTo1(uint32 x1, uint32 x2) internal pure returns (bool) {
    return x1 > x2 ? x1 - x2 == 1 : x2 - x1 == 1;
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

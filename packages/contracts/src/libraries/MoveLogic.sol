// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Position, PositionData } from "@/codegen/index.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

uint8 constant MAX_MOVES = 10;
uint32 constant STAMINA_COST = 10;

library MoveLogic {
  function _move(bytes32 host, uint64[] memory moves) internal {
    canMoveStrict(host, moves);

    // TODO: burn stamina
    uint32 staminaCost = uint32(moves.length) * STAMINA_COST;

    (uint32 toX, uint32 toY) = split(moves[moves.length - 1]);
    Position.set(host, toX, toY);
  }

  function canMoveStrict(bytes32 host, uint64[] memory moves) internal view {
    PositionData memory position = Position.get(host);
    (uint32 fromX, uint32 fromY) = split(moves[0]);
    if (position.x != fromX || position.y != fromY) revert Errors.NotFromHostPosition();
    if (moves.length > MAX_MOVES) revert Errors.ExceedMaxMoves();
    if (!isIncrementalMoves(moves)) revert Errors.NotIncrementalMoves();
    canMoveToStrict(moves);
  }

  function canMoveToStrict(uint64[] memory moves) internal view {
    for (uint256 i = 1; i < moves.length; i++) {
      (uint32 x, uint32 y) = split(moves[i]);
      MapLogic.canMoveToStrict(x, y);
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

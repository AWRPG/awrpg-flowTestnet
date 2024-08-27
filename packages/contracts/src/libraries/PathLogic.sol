// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Path, PathData } from "@/codegen/index.sol";
import { MapLogic } from "./MapLogic.sol";
import { MoveLogic } from "./MoveLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

// uint32 constant TILE_SIZE = 2 ** 4;
// uint32 constant MAP_SIZE = 2 ** 20;

library PathLogic {
  function getTileCoord(bytes32 host) internal view returns (uint32 tileX, uint32 tileY) {}

  function isPathExist(bytes32 entity) internal view returns (bool) {
    return Path.getLastUpdated(entity) != 0;
  }

  function arrived(bytes32 host) internal view returns (bool) {
    uint40 lastUpdated = Path.getLastUpdated(host);
    uint40 duration = Path.getDuration(host);
    return lastUpdated != 0 && lastUpdated + duration <= block.timestamp;
  }

  function _fly(bytes32 host, uint8[] memory moves) internal {}
}

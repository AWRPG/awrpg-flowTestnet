// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter } from "@/codegen/index.sol";
import { MoveLogic } from "@/libraries/MoveLogic.sol";
import { TypeCast } from "@/utils/TypeCast.sol";

contract MoveSystem is System {
  using TypeCast for address;

  function move(bytes32 host, uint8[] memory moves) public {
    MoveLogic._move(host, moves);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter } from "@/codegen/index.sol";
import { TypeCast } from "@/utils/TypeCast.sol";

contract PlayerSystem is System {
  using TypeCast for address;

  function spawn() public {}
}

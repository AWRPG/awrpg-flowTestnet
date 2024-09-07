// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { DropLogic } from "@/libraries/DropLogic.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { PositionControl } from "@/extensions/PositionControl.sol";

contract DropSystem is System, AccessControl, PositionControl {
  using TypeCast for address;

  function dropERC20(bytes32 role, bytes16 itemType, uint128 amount) public onlyCommander(role) {
    DropLogic._dropERC20(role, itemType, amount);
  }

  function pickupERC20(
    bytes32 role,
    bytes32 from,
    bytes16 itemType,
    uint128 amount,
    uint32 tileX,
    uint32 tileY
  ) public onlyCommander(role) onlyAdjacentCoord(role, tileX, tileY) {
    DropLogic._pickupERC20(role, from, itemType, amount, tileX, tileY);
  }
}

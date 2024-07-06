// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { PositionControl } from "@/extensions/PositionControl.sol";

contract StorageSystem is System, AccessControl, PositionControl {
  using TypeCast for address;

  // role <-> building; role <-> role
  function transferERC20(
    bytes16 itemType,
    bytes32 from,
    bytes32 to,
    uint128 amount
  ) public onlyController(from) onlyAdjacentHosts(from, to) {
    ContainerLogic._transfer(itemType, from, to, amount);
  }

  // function transferERC721
}

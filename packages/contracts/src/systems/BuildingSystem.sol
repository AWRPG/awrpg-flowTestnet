// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { BuildingLogic } from "@/libraries/BuildingLogic.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { PositionControl } from "@/extensions/PositionControl.sol";

contract BuildingSystem is System, AccessControl, PositionControl {
  using TypeCast for address;

  function buildBuilding(
    bytes32 role,
    bytes16 buildingType,
    uint32 x,
    uint32 y
  ) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    BuildingLogic._buildBuilding(role, buildingType, x, y);
  }

  function burnBuilding(bytes32 role, uint32 x, uint32 y) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    BuildingLogic._burnBuilding(role, x, y);
  }
}

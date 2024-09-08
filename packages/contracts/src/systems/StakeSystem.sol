// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Owner } from "@/codegen/index.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { PositionControl } from "@/extensions/PositionControl.sol";
import { StakeLogic } from "@/libraries/StakeLogic.sol";
import { BuildingLogic } from "@/libraries/BuildingLogic.sol";

contract StakeSystem is System, AccessControl, PositionControl {
  function stake(bytes32 role, uint32 x, uint32 y) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    bytes32 building = BuildingLogic.getBuildingFromCoord(x, y);
    StakeLogic._stake(role, building);
  }

  function unstake(bytes32 role, uint32 x, uint32 y) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    bytes32 building = BuildingLogic.getBuildingFromCoord(x, y);
    StakeLogic._unstake(role, building);
  }
}

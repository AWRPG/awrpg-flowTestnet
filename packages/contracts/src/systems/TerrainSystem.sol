// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { TerrainLogic } from "@/libraries/TerrainLogic.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { PositionControl } from "@/extensions/PositionControl.sol";

contract TerrainSystem is System, AccessControl, PositionControl {
  using TypeCast for address;

  function burnTerrain(bytes32 role, uint32 x, uint32 y) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    TerrainLogic._burnTerrain(role, x, y);
  }

  function interactTerrain(bytes32 role, uint32 x, uint32 y) public onlyCommander(role) onlyAdjacentCoord(role, x, y) {
    TerrainLogic._interactTerrain(role, x, y);
  }
}

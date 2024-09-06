// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Owner } from "@/codegen/index.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { AccessControl } from "@/extensions/AccessControl.sol";
import { EquipmentLogic } from "@/libraries/EquipmentLogic.sol";

contract EquipmentSystem is System, AccessControl {
  function equip(bytes32 equipment) public onlyCommander(Owner.get(equipment)) {
    EquipmentLogic._equip(equipment);
  }

  function unequip(bytes32 equipment) public {
    EquipmentLogic._unequipStrict(equipment);
  }
}

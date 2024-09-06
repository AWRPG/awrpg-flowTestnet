// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Weapon, Armor, Trinket, ArmorSpecs, WeaponSpecs, EntityType, Owner, SizeSpecs, Path, PathData } from "@/codegen/index.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { Errors } from "@/Errors.sol";

library EquipmentLogic {
  function _equip(bytes32 equipment) internal {
    bytes32 host = Owner.get(equipment);
    // if (!EntityLogic.isRole(role)) revert Errors.NotRoleType();

    if (EntityLogic.isArmor(equipment)) {
      Armor.set(host, equipment);
    } else if (EntityLogic.isWeapon(equipment)) {
      Weapon.set(host, equipment);
    }
    // revert
  }

  function _unequipStrict(bytes32 equipment) internal {
    bytes32 host = Owner.get(equipment);
    // if (!EntityLogic.isRole(role)) revert Errors.NotRoleType();

    if (EntityLogic.isArmor(equipment)) {
      if (Armor.get(host) != equipment) revert Errors.NotEquipped();
      Armor.deleteRecord(host);
    } else if (EntityLogic.isWeapon(equipment)) {
      if (Weapon.get(host) != equipment) revert Errors.NotEquipped();
      Weapon.deleteRecord(host);
    }
  }

  function getAttack(bytes32 host) internal view returns (uint16) {
    bytes32 weapon = Weapon.get(host);
    if (weapon == 0) return 0;
    return WeaponSpecs.getAttack(EntityType.get(weapon));
  }

  function getRange(bytes32 host) internal view returns (uint16) {
    bytes32 weapon = Weapon.get(host);
    if (weapon == 0) return 0;
    return WeaponSpecs.getRange(EntityType.get(weapon));
  }

  function getDefense(bytes32 host) internal view returns (uint16) {
    bytes32 armor = Armor.get(host);
    if (armor == 0) return 0;
    return ArmorSpecs.getDefense(EntityType.get(armor));
  }
}

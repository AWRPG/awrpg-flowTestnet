// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Path, TileEntity } from "@/codegen/index.sol";
import { EquipmentLogic } from "./EquipmentLogic.sol";
import { PoolLogic } from "./PoolLogic.sol";
import { DropLogic } from "./DropLogic.sol";
import { PathLogic } from "./PathLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import "@/constants.sol";

library CombatLogic {
  function _attack(bytes32 attacker, bytes32 defender) internal returns (bool defeated) {
    uint16 attack = EquipmentLogic.getAttack(attacker);
    uint16 defense = EquipmentLogic.getDefense(defender);
    uint16 damage = getDamage(attack, defense);
    defeated = PoolLogic._decreaseLoose(defender, RED, damage);
    if (!defeated) return defeated;

    _defeatRole(defender);
  }

  function getDamage(uint16 attack, uint16 defense) internal pure returns (uint16) {
    if (attack >= defense) {
      return attack * 2 - defense;
    } else {
      return (attack * attack) / defense;
    }
  }

  // remove TileEntity, keep entity & commander
  function _defeatRole(bytes32 role) internal {
    DropLogic._dropERC721(role);
    (uint32 x, uint32 y) = PathLogic.getPositionStrict(role);
    Path.deleteRecord(role);
    TileEntity.deleteRecord(MapLogic.getCoordId(x, y));
  }
}

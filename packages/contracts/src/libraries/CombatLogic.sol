// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Path, TileEntity } from "@/codegen/index.sol";
import { EquipmentLogic } from "./EquipmentLogic.sol";
import { PoolLogic } from "./PoolLogic.sol";
import { HeroLogic } from "./HeroLogic.sol";
import { BuildingLogic } from "./BuildingLogic.sol";
import { DropLogic } from "./DropLogic.sol";
import { PathLogic } from "./PathLogic.sol";
import { PositionLogic } from "./PositionLogic.sol";
import { EntityLogic } from "./EntityLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { MoveLogic } from "./MoveLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

/**
 * combat logic requires 1) item must have ATTACK, DEFENSE, or RANGE as pool balance, 2) item must be equipped as WEAPON, ARMOR, or TRINKET
 */
library CombatLogic {
  function _attack(bytes32 attacker, bytes32 defender) internal returns (bool defeated) {
    uint32 range = HeroLogic.getRange(attacker) + EquipmentLogic.getRange(attacker);
    if (!PositionLogic.withinRange(attacker, defender, range)) revert Errors.NotInRange();
    // TODO: burn self pool balance, such as stamina & soul

    uint32 attack = HeroLogic.getAttack(attacker) + EquipmentLogic.getAttack(attacker);
    uint32 defense = HeroLogic.getDefense(defender) + EquipmentLogic.getDefense(defender);
    uint32 damage = getDamage(attack, defense);
    defeated = PoolLogic._decreaseLoose(defender, BLOOD, damage);
    if (!defeated) return defeated;

    if (EntityLogic.isBuilding(defender)) {
      _defeatBuilding(defender);
    } else {
      _defeatRole(defender);
    }
  }

  function getDamage(uint32 attack, uint32 defense) internal pure returns (uint32) {
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

  function _defeatBuilding(bytes32 building) internal {
    (uint32 lowerX, uint32 lowerY) = PathLogic.getPositionStrict(building);
    BuildingLogic._burnBuilding(lowerX, lowerY);
  }

  function _revive(bytes32 role, bytes32 target) internal {
    // TODO: burn some tokens from role

    (uint32 x, uint32 y) = DropLogic._reviveRole(target);
    MoveLogic.canMoveToTileStrict(target, x, y);
    MapLogic._initGroundPath(target, x, y);

    PoolLogic._increaseLoose(target, BLOOD, 1);
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, Commander, Position, EntityCoord, EntityType } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";
import "@/hashes.sol";

// TODO: change name to RoleLogic?
library HeroLogic {
  function _spawn(bytes32 player) internal {
    bytes32 hero = ContainerLogic._mint(HOST, space());
    Commander.set(hero, player);

    bytes32 bloodPool = getPool(hero, BLOOD);
    EntityType.set(bloodPool, POOL);
    // Owner.set() allows clientside to track pool balance changes back to role
    // essentially, a trade-off between requireing three writes when spawning
    // vs. clientside code tracking pool-> player
    Owner.set(bloodPool, hero);
    ContainerLogic._mint(BLOOD, bloodPool, 1000);

    bytes32 soulPool = getPool(hero, SOUL);
    EntityType.set(soulPool, POOL);
    Owner.set(soulPool, hero);
    ContainerLogic._mint(SOUL, soulPool, 1000);

    bytes32 staminaPool = getPool(hero, STAMINA);
    EntityType.set(staminaPool, POOL);
    Owner.set(staminaPool, hero);
    ContainerLogic._mint(STAMINA, staminaPool, 1000);

    (uint32 x, uint32 y) = MapLogic.getRandomEmptyPosition(uint256(hero), 32, 32);
    Position.set(hero, x, y);
    EntityCoord.set(MapLogic.getCoordId(x, y), hero);
  }

  function _delete(bytes32 hero) internal {
    ContainerLogic._burn(hero);
    Position.deleteRecord(hero);
  }

  function _deprive(bytes32 hero) internal {
    Commander.deleteRecord(hero);
  }
}

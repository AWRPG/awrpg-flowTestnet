// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, Commander, Position, EntityType } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";
import "@/hashes.sol";

library HeroLogic {
  function _spawn(bytes32 player) internal {
    bytes32 hero = ContainerLogic._mint(HOST, space());
    Commander.set(hero, player);

    // TODO: randomly set hero position or ask player to set
    uint32 x = 20;
    uint32 y = 20;
    Position.set(hero, x, y);

    bytes32 bloodPool = getPool(hero, BLOOD);
    EntityType.set(bloodPool, POOL);
    ContainerLogic._mint(BLOOD, bloodPool, 1000);

    bytes32 soulPool = getPool(hero, SOUL);
    EntityType.set(soulPool, POOL);
    ContainerLogic._mint(SOUL, soulPool, 1000);

    bytes32 staminaPool = getPool(hero, STAMINA);
    EntityType.set(staminaPool, POOL);
    ContainerLogic._mint(STAMINA, staminaPool, 1000);
  }
}

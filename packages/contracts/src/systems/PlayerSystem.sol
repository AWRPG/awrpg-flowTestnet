// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { TypeCast } from "@/utils/TypeCast.sol";
import { HeroLogic } from "@/libraries/HeroLogic.sol";

contract PlayerSystem is System {
  using TypeCast for address;

  function spawnHero() public returns (uint32, uint32, bytes32) {
    bytes32 player = _msgSender().toBytes32();
    (uint32 x, uint32 y, bytes32 hero) = HeroLogic._spawn(player);
    return (x, y, hero);
  }
}

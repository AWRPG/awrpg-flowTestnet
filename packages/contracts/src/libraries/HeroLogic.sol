// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, Commander, Position, TileEntity, EntityType, StatsSpecs } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { MapLogic } from "@/libraries/MapLogic.sol";
import { Errors } from "@/Errors.sol";
import { PoolLogic } from "@/libraries/PoolLogic.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import "@/constants.sol";
import "@/hashes.sol";

// TODO: change name to RoleLogic?
library HeroLogic {
  function _spawn(bytes32 player) internal returns (uint32, uint32, bytes32) {
    bytes32 hero = ContainerLogic._mint(HOST, space());
    Commander.set(hero, player);

    PoolLogic._initPools(hero);

    (uint32 x, uint32 y) = MapLogic.getRandomEmptyPosition(uint256(hero), 2 ** 16 - 32, 2 ** 16 - 32, 2 ** 16, 2 ** 16);
    MapLogic._initGroundPath(hero, x, y);
    return (x, y, hero);
  }

  function _delete(bytes32 hero) internal {
    ContainerLogic._burn(hero);
    Position.deleteRecord(hero);
  }

  function _deprive(bytes32 hero) internal {
    Commander.deleteRecord(hero);
  }
}

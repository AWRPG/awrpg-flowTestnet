// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, Balance, EntityType } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";
import "@/hashes.sol";

library PoolLogic {
  function getPoolAmount(bytes32 role, bytes16 poolType) internal view returns (uint256) {
    bytes32 pool = getPool(role, poolType);
    return Balance.get(poolType, pool);
  }

  function _decreaseStrict(bytes32 role, bytes16 poolType, uint128 amount) internal {
    bytes32 pool = getPool(role, poolType);
    ContainerLogic._burn(poolType, pool, amount);
  }

  // used in combat
  function _decreaseLoose(bytes32 role, bytes16 poolType, uint128 amount) internal returns (bool empty) {
    uint256 poolAmount = getPoolAmount(role, poolType);
    if (poolAmount <= amount) {
      return empty = true;
    } else {
      _decreaseStrict(role, poolType, amount);
      return empty = false;
    }
  }

  function _increaseLoose(bytes32 role, bytes16 poolType, uint128 amount) internal {
    bytes32 pool = getPool(role, poolType);
    ContainerLogic._mintLoose(poolType, pool, amount);
  }

  function _extract(bytes32 role, bytes16 poolType, uint128 amount) internal {
    bytes32 pool = getPool(role, poolType);
    ContainerLogic._transfer(poolType, pool, role, amount);
  }

  function _inject(bytes32 role, bytes16 poolType, uint128 amount) internal {
    bytes32 pool = getPool(role, poolType);
    ContainerLogic._transfer(poolType, role, pool, amount);
  }
}

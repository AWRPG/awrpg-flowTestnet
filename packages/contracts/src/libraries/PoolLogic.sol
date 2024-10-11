// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, Balance, EntityType, StatsSpecs } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { ERC20Logic } from "@/libraries/ERC20Logic.sol";
import { Errors } from "@/Errors.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import "@/constants.sol";
import "@/hashes.sol";

library PoolLogic {
  function getMaxPoolAmount(bytes32 role, bytes16 poolType) internal view returns (uint128) {
    bytes16 roleType = EntityType.get(role);
    bytes32[] memory maxPools = StatsSpecs.getMaxPools(roleType);
    for (uint256 i = 0; i < maxPools.length; i++) {
      (bytes16 poolType_, bytes16 amount) = LibUtils.splitBytes32(maxPools[i]);
      if (poolType == poolType_) {
        return uint128(amount);
      }
    }
    return 0;
  }

  function getPoolAmount(bytes32 role, bytes16 poolType) internal view returns (uint256) {
    return Balance.get(poolType, role);
  }

  function _decreaseStrict(bytes32 role, bytes16 poolType, uint128 amount) internal {
    ERC20Logic._burn(poolType, role, amount);
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

  /**
   * increase cannot exceed max pool amount
   */
  function _increaseLoose(bytes32 role, bytes16 poolType, uint128 amount) internal {
    uint128 maxAmount = getMaxPoolAmount(role, poolType);
    uint256 poolAmount = getPoolAmount(role, poolType);
    uint256 mintAmount = poolAmount + amount > maxAmount ? maxAmount - poolAmount : amount;
    ERC20Logic._mint(poolType, role, mintAmount);
  }

  function _restorePool(bytes32 role, bytes16 poolType) internal {
    uint128 maxAmount = getMaxPoolAmount(role, poolType);
    uint256 poolAmount = getPoolAmount(role, poolType);
    if (poolAmount < maxAmount) {
      ERC20Logic._mint(poolType, role, maxAmount - poolAmount);
    }
  }

  // function _extract(bytes32 role, bytes16 poolType, uint128 amount) internal {
  //   bytes32 pool = getPool(role, poolType);
  //   ContainerLogic._transfer(poolType, pool, role, amount);
  // }

  // function _inject(bytes32 role, bytes16 poolType, uint128 amount) internal {
  //   bytes32 pool = getPool(role, poolType);
  //   ContainerLogic._transfer(poolType, role, pool, amount);
  // }
}

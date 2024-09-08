// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StakeSpecs, StakeSpecsData, EntityType, StakingInfo } from "@/codegen/index.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { PoolLogic } from "@/libraries/PoolLogic.sol";
import { AwardLogic } from "@/libraries/AwardLogic.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

// need to make sure building creator cannot access what's staked in building
library StakeLogic {
  function _stake(bytes32 host, bytes32 building) internal {
    bytes16 buildingType = EntityType.get(building);
    if (StakeSpecs.getTimeCost(buildingType) == 0) revert Errors.WrongBuildingTypeToStake();

    bytes32[] memory inputs = StakeSpecs.getInputs(buildingType);
    bytes32 stakingId = getStaking(host, building);
    _stakeInputs(inputs, host, building);

    StakingInfo.set(stakingId, host, building, uint40(block.timestamp));
  }

  function _unstake(bytes32 host, bytes32 building) internal {
    bytes32 stakingId = getStaking(host, building);
    if (StakingInfo.getBuilding(stakingId) != building) revert Errors.HasNoStakeInBuilding();

    bytes16 buildingType = EntityType.get(building);
    bytes32[] memory inputs = StakeSpecs.getInputs(buildingType);
    _stakeInputs(inputs, building, host);

    StakingInfo.deleteRecord(host);
  }

  function _claim(bytes32 host, bytes32 building) internal {
    bytes32 stakingId = getStaking(host, building);
    if (StakingInfo.getBuilding(stakingId) != building) revert Errors.HasNoStakeInBuilding();

    if (!canClaim(host, building)) return;
    bytes16 buildingType = EntityType.get(building);
    bytes32[] memory outputs = StakeSpecs.getOutputs(buildingType);

    AwardLogic._mintAwards(outputs, host);
    StakingInfo.setLastUpdated(host, uint40(block.timestamp));
  }

  /**
   * claim (loose) & unstake (strict)
   */
  function _claimAndUnstake(bytes32 host, bytes32 building) internal {
    bytes32 stakingId = getStaking(host, building);
    if (StakingInfo.getBuilding(stakingId) != building) revert Errors.HasNoStakeInBuilding();

    bytes16 buildingType = EntityType.get(building);
    if (canClaim(host, building)) {
      bytes32[] memory outputs = StakeSpecs.getOutputs(buildingType);
      AwardLogic._mintAwards(outputs, host);
    }

    bytes32[] memory inputs = StakeSpecs.getInputs(buildingType);
    _unstakeInputs(inputs, building, host);

    StakingInfo.deleteRecord(host);
  }

  function canClaim(bytes32 host, bytes32 building) internal view returns (bool) {
    bytes32 stakingId = getStaking(host, building);
    uint40 lastUpdated = StakingInfo.getLastUpdated(stakingId);
    return lastUpdated != 0 && lastUpdated + StakeSpecs.getTimeCost(EntityType.get(building)) <= block.timestamp;
  }

  /**
   * burn pool & transfer from host to stake into building
   */
  function _stakeInputs(bytes32[] memory inputs, bytes32 from, bytes32 to) internal {
    for (uint256 i = 0; i < inputs.length; i++) {
      bytes32 input = inputs[i];
      (bytes16 costType, bytes16 amount) = LibUtils.splitBytes32(input);

      if (EntityLogic.isPoolType(costType)) {
        PoolLogic._decreaseStrict(from, costType, uint128(amount));
      } else {
        ContainerLogic._transfer(costType, from, to, uint128(amount));
      }
    }
  }

  /**
   * skip pool & transfer from building to host
   */
  function _unstakeInputs(bytes32[] memory inputs, bytes32 from, bytes32 to) internal {
    for (uint256 i = 0; i < inputs.length; i++) {
      bytes32 input = inputs[i];
      (bytes16 costType, bytes16 amount) = LibUtils.splitBytes32(input);

      if (!EntityLogic.isPoolType(costType)) {
        ContainerLogic._transfer(costType, from, to, uint128(amount));
      }
    }
  }
}

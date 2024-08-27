// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner, BurnAwards, BuildingSpecs, EntityType } from "@/codegen/index.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

library EntityLogic {
  function isOwner(bytes32 entity, bytes32 owner) internal view returns (bool) {
    bytes32 curr = entity;
    while (curr != owner) {
      curr = Owner.get(curr);
      if (curr == 0) return false;
    }
    return true;
  }

  // hardcoded pool type; can consider putting them into table later
  function isPoolType(bytes16 entityType) internal pure returns (bool) {
    return entityType == BLOOD || entityType == SOUL || entityType == STAMINA;
  }

  function hasBurnAwards(bytes16 burnType) internal view returns (bool) {
    return BurnAwards.lengthAwards(burnType) != 0;
  }

  // function hasMin

  function isBuilding(bytes32 building) internal view returns (bool) {
    return isBuildingType(EntityType.get(building));
  }

  function isBuildingType(bytes16 buildingType) internal view returns (bool) {
    return BuildingSpecs.getTerrainType(buildingType) != 0;
  }

  function isRole(bytes32 role) internal view returns (bool) {
    // TODO: add role check
    return true;
  }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Position, BuildingSpecs, BuildingCoord, EntityType, TerrainSpecs, RemovedCoord, UpgradeCosts, SizeSpecs } from "@/codegen/index.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import { ContainerLogic } from "./ContainerLogic.sol";
import { AwardLogic } from "./AwardLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { CostLogic } from "./CostLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

library BuildingLogic {
  // burn erc20s, which mint erc721, a building
  function _buildBuilding(bytes32 role, bytes16 buildingType, uint32 x, uint32 y) internal {
    // check terrainType to build on
    bytes16 terrainType = MapLogic.getTerrainType(x, y);
    if (terrainType != BuildingSpecs.getTerrainType(buildingType)) revert Errors.WrongTerrainToBuildOn();

    // check if there is already a building
    bytes32 coordId = MapLogic.getCoordId(x, y);
    if (BuildingCoord.get(coordId) != 0) revert Errors.HasBuildingOnCoord();

    // burn costs
    CostLogic._burnMintCosts(buildingType, role);

    // mint building
    bytes32 building = ContainerLogic._mint(buildingType, space());
    BuildingCoord.set(coordId, building);
    Position.set(building, x, y);
  }

  // burn erc721 (building), which burn erc20s & award erc20s
  function _burnBuilding(bytes32 role, uint32 x, uint32 y) internal {
    bytes32 coordId = MapLogic.getCoordId(x, y);
    bytes32 building = BuildingCoord.get(coordId);
    if (building == 0) revert Errors.NoBuildingOnCoord();

    bytes16 buildingType = EntityType.get(building);
    CostLogic._burnBurnCosts(buildingType, role);

    AwardLogic._mintBurnAwards(buildingType, role);

    ContainerLogic._burn(building);
    BuildingCoord.deleteRecord(coordId);
    Position.deleteRecord(building);
  }

  // ------- individual buildingType has its own active functionalities -------
  function _storeERC721(bytes32 role, bytes32 building, bytes32 item) internal {}

  function _storeERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _exportERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _upgradeBuilding(bytes32 role, bytes32 building) internal {}

  function _produceERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _produceERC721(bytes32 role, bytes32 building, bytes16 erc721Type) internal {}
}

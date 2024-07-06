// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Position, BuildingSpecs, EntityCoord, EntityType, TerrainSpecs, RemovedCoord, UpgradeCosts, SizeSpecs, Creator } from "@/codegen/index.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import { ContainerLogic } from "./ContainerLogic.sol";
import { AwardLogic } from "./AwardLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { CostLogic } from "./CostLogic.sol";
import { EntityLogic } from "./EntityLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

library BuildingLogic {
  // burn erc20s, which mint erc721, a building
  function _buildBuilding(bytes32 player, bytes32 role, bytes16 buildingType, uint32 x, uint32 y) internal {
    // check terrainType to build on
    bytes16 terrainType = MapLogic.getTerrainType(x, y);
    if (terrainType != BuildingSpecs.getTerrainType(buildingType)) revert Errors.WrongTerrainToBuildOn();

    // check if there is already a building
    bytes32 coordId = MapLogic.getCoordId(x, y);
    if (EntityCoord.get(coordId) != 0) revert Errors.HasEntityOnCoord();

    // burn costs
    CostLogic._burnMintCosts(buildingType, role);

    // mint building
    bytes32 building = ContainerLogic._mint(buildingType, space());
    EntityCoord.set(coordId, building);
    Position.set(building, x, y);
    Creator.set(building, player);
  }

  // burn erc721 (building), which burn erc20s & award erc20s
  function _burnBuilding(bytes32 role, uint32 x, uint32 y) internal {
    bytes32 coordId = MapLogic.getCoordId(x, y);
    bytes32 entity = EntityCoord.get(coordId);
    if (entity == 0) revert Errors.HasNoEntityOnCoord();

    bytes16 entityType = EntityType.get(entity);
    if (!EntityLogic.isBuildingType(entityType)) revert Errors.NotBuildingType();
    CostLogic._burnBurnCosts(entityType, role);

    AwardLogic._mintBurnAwards(entityType, role);

    ContainerLogic._burn(entity);
    EntityCoord.deleteRecord(coordId);
    Position.deleteRecord(entity);
    Creator.deleteRecord(entity);
  }

  // ------- individual buildingType has its own active functionalities -------
  function _storeERC721(bytes32 role, bytes32 building, bytes32 item) internal {}

  function _storeERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _exportERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _upgradeBuilding(bytes32 role, bytes32 building) internal {}

  function _produceERC20(bytes32 role, bytes32 building, bytes16 erc20Type, uint128 amount) internal {}

  function _produceERC721(bytes32 role, bytes32 building, bytes16 erc721Type) internal {}
}

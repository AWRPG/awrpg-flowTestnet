// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Position, BuildingSpecs, TileEntity, EntityType, TerrainSpecs, RemovedCoord, UpgradeCosts, SizeSpecs, Creator } from "@/codegen/index.sol";
import { LibUtils } from "@/utils/LibUtils.sol";
import { ContainerLogic } from "./ContainerLogic.sol";
import { AwardLogic } from "./AwardLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { TerrainLogic } from "./TerrainLogic.sol";
import { CostLogic } from "./CostLogic.sol";
import { EntityLogic } from "./EntityLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

library BuildingLogic {
  // burn erc20s, which mint erc721, a building
  function _buildBuilding(
    bytes32 player,
    bytes32 role,
    bytes16 buildingType,
    uint32 x1,
    uint32 y1,
    uint32 lowerX,
    uint32 lowerY
  ) internal {
    bytes32[] memory tileIds = getRectangleCoordIdsStrict(
      x1,
      y1,
      lowerX,
      lowerY,
      BuildingSpecs.getWidth(buildingType),
      BuildingSpecs.getHeight(buildingType)
    );
    // check terrainType to build on
    canBuildOnTilesStrict(buildingType, tileIds);

    // burn costs
    CostLogic._burnMintCosts(buildingType, role);

    // mint building
    bytes32 building = ContainerLogic._mint(buildingType, space());
    _setTileEntitiesStrict(building, tileIds);
    // Position.set(building, x, y);
    Creator.set(building, player);
  }

  function canBuildOnTilesStrict(bytes16 buildingType, bytes32[] memory coordIds) internal view {
    bytes16 buildOnTerrainType = BuildingSpecs.getTerrainType(buildingType);
    for (uint256 i = 0; i < coordIds.length; i++) {
      canBuildOnTileStrict(buildOnTerrainType, coordIds[i]);
    }
  }

  function canBuildOnTileStrict(bytes16 buildOnTerrainType, bytes32 tileId) internal view {
    (uint32 x, uint32 y) = MapLogic.splitCoordId(tileId);
    bytes16 terrainType = TerrainLogic.getTerrainEntityType(x, y);
    if (terrainType != buildOnTerrainType) revert Errors.WrongTerrainToBuildOn();
  }

  function _setTileEntitiesStrict(bytes32 entity, bytes32[] memory tileIds) internal {
    for (uint256 i = 0; i < tileIds.length; i++) {
      _setTileEntityStrict(entity, tileIds[i]);
    }
  }

  function _setTileEntityStrict(bytes32 entity, bytes32 tileId) internal {
    if (TileEntity.get(tileId) != 0) revert Errors.HasEntityOnCoord();
    TileEntity.set(tileId, entity);
  }

  function getRectangleCoordIdsStrict(
    uint32 x1,
    uint32 y1,
    uint32 lowerX,
    uint32 lowerY,
    uint8 width,
    uint8 height
  ) internal pure returns (bytes32[] memory) {
    uint32 upperX = lowerX + width - 1;
    uint32 upperY = lowerY + height - 1;
    bytes32[] memory coords = new bytes32[](width * height);
    uint32 index = 0;
    bool isWithin = false;
    for (uint32 x = lowerX; x <= upperX; x++) {
      for (uint32 y = lowerY; y <= upperY; y++) {
        if (x == x1 && y == y1) isWithin = true;
        coords[index] = MapLogic.getCoordId(x, y);
        index++;
      }
    }
    if (!isWithin) revert Errors.NotWithinRectangle();
    return coords;
  }

  // burn erc721 (building), which burn erc20s & award erc20s
  function _burnBuilding(bytes32 role, uint32 x, uint32 y) internal {
    bytes32 coordId = MapLogic.getCoordId(x, y);
    bytes32 entity = TileEntity.get(coordId);
    if (entity == 0) revert Errors.HasNoEntityOnCoord();

    bytes16 entityType = EntityType.get(entity);
    if (!EntityLogic.isBuildingType(entityType)) revert Errors.NotBuildingType();
    CostLogic._burnBurnCosts(entityType, role);

    AwardLogic._mintBurnAwards(entityType, role);

    ContainerLogic._burn(entity);
    TileEntity.deleteRecord(coordId);
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

  // ------- check if the building can moved to/across -------
  function canMoveTo(bytes32 building) internal view returns (bool) {
    bytes16 buildingType = EntityType.get(building);
    return BuildingSpecs.getCanMove(buildingType);
  }
}

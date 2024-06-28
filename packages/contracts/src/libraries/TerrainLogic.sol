// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { TerrainSpecs, RemovedCoord } from "@/codegen/index.sol";
import { AwardLogic } from "./AwardLogic.sol";
import { MapLogic } from "./MapLogic.sol";
import { CostLogic } from "./CostLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/hashes.sol";
import "@/constants.sol";

library TerrainLogic {
  function _burnTerrain(bytes32 role, uint32 x, uint32 y) internal {
    bytes32 coordId = MapLogic.getCoordId(x, y);
    bytes16 terrainType = MapLogic.getTerrainType(x, y);
    if (!TerrainSpecs.getCanBurn(terrainType)) revert Errors.NoTerrainToBurn();

    CostLogic._burnBurnCosts(terrainType, role);

    AwardLogic._mintBurnAwards(terrainType, role);

    RemovedCoord.set(coordId, true);
  }
}

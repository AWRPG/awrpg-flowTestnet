// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "@/codegen/world/IWorld.sol";
import "@/codegen/index.sol";

library DefineTypes {
  function defineTerrain(bytes16 terrainType, TerrainSpecsData memory terrainSpecs) internal {
    TerrainSpecs.set(terrainType, terrainSpecs);
  }
}

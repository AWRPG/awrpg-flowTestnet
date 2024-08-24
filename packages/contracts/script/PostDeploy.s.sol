// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Position } from "@/codegen/index.sol";
import { initializeTypes } from "@/setup/initialize.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { TerrainLogic } from "@/libraries/TerrainLogic.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Specify a store so that you can use tables directly in PostDeploy
    StoreSwitch.setStoreAddress(worldAddress);
    IWorld world = IWorld(worldAddress);

    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);
    initializeTypes();
    (uint32 x, uint32 y) = world.spawnHero();
    // TerrainLogic._setTerrainValue(x, y, uint8(TerrainLogic.TerrainType.PLAIN));
    // TerrainLogic._setTerrainValue(x + 1, y, uint8(TerrainLogic.TerrainType.PLAIN));
    // TerrainLogic._setTerrainValue(x + 2, y, uint8(TerrainLogic.TerrainType.PLAIN));

    vm.stopBroadcast();
  }
}

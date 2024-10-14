// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { initializeTypes } from "@/setup/initialize.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { TerrainLogic } from "@/libraries/TerrainLogic.sol";
import { PathLogic } from "@/libraries/PathLogic.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { EquipmentLogic } from "@/libraries/EquipmentLogic.sol";
import "@/constants.sol";

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
    (uint32 x, uint32 y, bytes32 hero) = world.spawnHero();
    ContainerLogic._mint(BERRY, hero, 10);
    bytes32 sword = EntityLogic._mint(SWORD, hero);
    // EquipmentLogic._equip(sword);
    (, , bytes32 hero2) = world.spawnHero();
    ContainerLogic._mint(BERRY, hero2, 10);
    world.buildBuilding(hero, SAFE, x - 1, y, x - 2, y - 1);
    // world.buildBuilding(hero, FIELD, x - 1, y, x - 3, y);
    // TerrainLogic._setTerrainValue(x, y, uint8(TerrainLogic.TerrainType.PLAIN));
    // TerrainLogic._setTerrainValue(x + 1, y, uint8(TerrainLogic.TerrainType.PLAIN));
    // TerrainLogic._setTerrainValue(x + 2, y, uint8(TerrainLogic.TerrainType.PLAIN));

    vm.stopBroadcast();
  }
}

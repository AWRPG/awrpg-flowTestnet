// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IBuildingSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IBuildingSystem {
  function buildBuilding(
    bytes32 role,
    bytes16 buildingType,
    uint32 x1,
    uint32 y1,
    uint32 lowerX,
    uint32 lowerY
  ) external;

  function burnBuilding(bytes32 role, uint32 x, uint32 y) external;
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IDropsSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IDropsSystem {
  function dropERC20(bytes32 role, bytes16 itemType, uint128 amount) external;

  function pickupERC20(
    bytes32 role,
    bytes32 from,
    bytes16 itemType,
    uint128 amount,
    uint32 tileX,
    uint32 tileY
  ) external;
}
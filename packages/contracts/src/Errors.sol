// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";

contract Errors is System {
  // access error
  error NotCommander();
  error NotApproved();

  // move error
  error CannotMoveToTerrain(bytes16 terrainType);
  error CannotMoveToBuilding(bytes32 coordId);
  error ExceedMaxMoves();
  error NotIncrementalMoves();
  error NotFromHostPosition();
  error InvalidMove();

  // Token errors
  error MintToNull();
  error TransferFromNull();
  error TransferToNull();
  error TransferExceedsBalance();
  error TransferIncorrectOwner();
  error BurnFromNull();
  error BurnExceedsBalance();
  error Minted();
  error ApproveOwnerNull();
  error ApproveSpenderNull();
  error InsufficientAllowance();

  // Storage errors
  error InsufficientStorage();
  error StorageUnderflow();
  error NestedContainer();

  // building errors
  error HasBuildingOnCoord();
  error WrongTerrainToBuildOn();
  error NoBuildingOnCoord();

  // terrain errors
  error NoTerrainToBurn();

  // upgrade errors
  error NoAvailableUpgrade();
}

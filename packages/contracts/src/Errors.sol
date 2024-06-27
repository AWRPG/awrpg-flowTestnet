// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";

contract Errors is System {
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
}

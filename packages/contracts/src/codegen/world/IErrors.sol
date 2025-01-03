// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

/**
 * @title IErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IErrors {
  error NotCommander();
  error NotApproved();
  error NotController();
  error PathNotExist();
  error NotAdjacent();
  error NotOnGround();
  error NotArrived();
  error CannotMoveAcrossBuilding();
  error CannotMoveToTerrain();
  error CannotMoveOnEntity(bytes32 coordId);
  error ExceedMaxMoves();
  error NotIncrementalMoves();
  error NotFromHostPosition();
  error InvalidMove();
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
  error InsufficientStorage();
  error StorageUnderflow();
  error NestedContainer();
  error NoMine();
  error BuildingNotMiner();
  error BuildingNotOnCoord();
  error NotWithinRectangle();
  error HasNoEntityOnCoord();
  error HasEntityOnCoord();
  error WrongTerrainToBuildOn();
  error NoBuildingOnCoord();
  error NoTerrainToBurn();
  error NoAvailableUpgrade();
  error NotBuildingType();
  error NotWeaponType();
  error NotArmorType();
  error NotRoleType();
  error NotEquipped();
  error AlreadyEquipped();
  error SwapRatioNotSet();
  error NotInDropContainer();
  error WrongBuildingTypeToStake();
  error HasNoStakeInBuilding();
  error AlreadyHasStaking();
  error WrongBuildingTypeToCook();
  error HasNoCookingInBuilding();
  error AlreadyHasCooking();
  error NotInRange();
  error PlayerExists();
}

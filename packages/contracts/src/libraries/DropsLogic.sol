// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Path, Counter, Owner, TotalSupply, EntityType } from "@/codegen/index.sol";
import { ContainerLogic } from "@/libraries/ContainerLogic.sol";
import { PathLogic } from "@/libraries/PathLogic.sol";
import { EntityLogic } from "@/libraries/EntityLogic.sol";
import { Errors } from "@/Errors.sol";
import "@/constants.sol";

// TODO: set DROPS SizeSpecs
library DropsLogic {
  function _pickupERC20(
    bytes32 role,
    bytes32 from,
    bytes16 entityType,
    uint256 amount,
    uint32 tileX,
    uint32 tileY
  ) internal {
    bytes32 dropsContainer = getDropsContainer(tileX, tileY);
    inDropsContainerStrict(dropsContainer, from);
    ContainerLogic._transfer(entityType, from, role, amount);
  }

  function _dropERC20(bytes32 role, bytes16 entityType, uint256 amount) internal {
    (uint32 currX, uint32 currY) = PathLogic.getPositionStrict(role);
    bytes32 dropsContainer = _mintDropsContainer(currX, currY);
    ContainerLogic._transfer(entityType, role, dropsContainer, amount);
  }

  function _pickupERC721(bytes32 role, bytes32 from, bytes32 entity, uint32 tileX, uint32 tileY) internal {
    bytes32 dropsContainer = getDropsContainer(tileX, tileY);
    inDropsContainerStrict(dropsContainer, from);
    ContainerLogic._transfer(from, role, entity);
  }

  // also used for defeated role?
  // get topHost because entity could be role or nft inside role
  function _dropERC721(bytes32 entity) internal {
    bytes32 topHost = EntityLogic.getTopHost(entity);
    (uint32 currX, uint32 currY) = PathLogic.getPositionStrict(topHost);
    bytes32 dropsContainer = _mintDropsContainer(currX, currY);
    ContainerLogic._transfer(Owner.get(entity), dropsContainer, entity);
  }

  function inDropsContainerStrict(bytes32 dropsContainer, bytes32 from) internal view {
    bytes32 topHost = EntityLogic.getTopHost(from);
    if (topHost != dropsContainer) revert Errors.NotInDropsContainer();
  }

  function _mintDropsContainer(uint32 tileX, uint32 tileY) internal returns (bytes32) {
    bytes32 dropsContainer = getDropsContainer(tileX, tileY);
    if (dropsContainerExist(tileX, tileY)) return dropsContainer;
    ContainerLogic._mint(DROPS, space(), dropsContainer);
    PathLogic._initPath(dropsContainer, tileX, tileY);
    return dropsContainer;
  }

  function getDropsContainer(uint32 tileX, uint32 tileY) internal pure returns (bytes32) {
    bytes32 tileXBytes = bytes32(uint256(tileX));
    bytes32 tileYBytes = bytes32(uint256(tileY));

    bytes32 result = bytes32(DROPS) | (tileXBytes << 64) | tileYBytes;
    return result;
  }

  function splitDropsContainer(bytes32 container) internal pure returns (bytes16, uint32, uint32) {
    bytes16 drops = bytes16(container);
    uint32 tileX = uint32(uint256(container >> 64));
    uint32 tileY = uint32(uint256(container));
    return (drops, tileX, tileY);
  }

  function dropsContainerExist(uint32 tileX, uint32 tileY) internal view returns (bool) {
    bytes32 container = getDropsContainer(tileX, tileY);
    return Owner.get(container) != 0;
  }

  function isDropsContainer(bytes32 container) internal pure returns (bool) {
    (bytes16 drops, , ) = splitDropsContainer(container);
    return drops == DROPS;
  }
}

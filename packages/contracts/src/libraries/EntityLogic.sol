// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Owner } from "@/codegen/index.sol";
import { Errors } from "@/Errors.sol";

library EntityLogic {
  function isOwner(bytes32 entity, bytes32 owner) internal view returns (bool) {
    bytes32 curr = entity;
    while (curr != owner) {
      curr = Owner.get(curr);
      if (curr == 0) return false;
    }
    return true;
  }
}

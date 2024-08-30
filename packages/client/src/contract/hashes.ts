import { Hex, encodeAbiParameters, keccak256 } from "viem";
import { CUSTODIAN } from "./constants";

export function getPool(role: Hex, poolType: Hex) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes16" }],
      [role, poolType]
    )
  ) as Hex;
}

export function getCustodian(building: Hex) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes16" }],
      [building, CUSTODIAN]
    )
  ) as Hex;
}

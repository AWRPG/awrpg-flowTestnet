import { Hex, encodeAbiParameters, keccak256 } from "viem";

export function getPool(role: Hex, poolType: Hex) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes16" }],
      [role, poolType]
    )
  ) as Hex;
}

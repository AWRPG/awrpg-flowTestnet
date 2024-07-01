import { Hex, encodeAbiParameters } from "viem";
import { keccak256 } from "ethers/lib/utils";

export function getPool(role: Hex, poolType: Hex) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes16" }],
      [role, poolType]
    )
  ) as Hex;
}

// combine two number into one bigint
export function combine(x: number, y: number) {
  return ((BigInt(x) << 32n) | BigInt(y)).toString();
}

// split one bigint into two number
export function split(xy: bigint) {
  const x = Number(xy >> 32n);
  const y = Number(xy & 0xffffffffn);
  return { x, y };
}

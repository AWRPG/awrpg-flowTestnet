import { Entity, getComponentValue, setComponent } from "@latticexyz/recs";
import { Vector } from "matter";
import { SOURCE } from "../constants";
import { oppositeDirection } from "../hooks/useHotKeys";
import { ClientComponents } from "../mud/createClientComponents";
import { canMoveTo } from "./map";
import { SystemCalls } from "../mud/createSystemCalls";

export enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
}

// assuming moves are valid
export function movesToPositions(moves: Direction[], from: Vector): Vector[] {
  return moves.reduce(
    (acc, move) => {
      const last = acc[acc.length - 1];
      return [...acc, moveTo(move, last)];
    },
    [from]
  );
}

export function validMovesForHost(
  components: ClientComponents,
  systemCalls: SystemCalls,
  host: Entity,
  moves: Direction[]
) {
  const from = getComponentValue(components.Position, host);
  if (!from) return;
  const { x, y } = from;
  return validMovesFrom(components, systemCalls, { x, y }, moves);
}

export function validMovesFrom(
  components: ClientComponents,
  systemCalls: SystemCalls,
  from: Vector,
  moves: Direction[]
): Direction[] {
  if (moves.length > 10) return moves.slice(0, 10);
  let to = from;
  const toPositions: Vector[] = [to];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    to = moveTo(move, to);
    toPositions.push(to);
    if (!validMoveTo(components, systemCalls, to)) {
      return i === 0 ? [] : moves.slice(0, i);
    }
  }
  // check loop
  if (toPositions.length < 2) return moves;
  const last = toPositions[toPositions.length - 1];
  toPositions.pop();
  const index = toPositions.findIndex((p) => p.x === last.x && p.y === last.y);
  return index === -1 ? moves : moves.slice(0, index);
}

export function validMoveTo(
  components: ClientComponents,
  systemCalls: SystemCalls,
  to: Vector
) {
  const onMap = isOnMap(to);
  const canMove = canMoveTo(components, systemCalls, to);
  return onMap && canMove;
}
// export function moveToPositionStrict(move: Direction, from: Vector): Vector {
//   const to = moveToPosition(move, from);
//   return isOnMap(to) ? to : from;
// }

export function moveTo(move: Direction, from: Vector): Vector {
  const { x, y } = from;
  if (move === Direction.UP) return { x, y: y - 1 };
  if (move === Direction.DOWN) return { x, y: y + 1 };
  if (move === Direction.LEFT) return { x: x - 1, y };
  return { x: x + 1, y };
}

export function isOnMap(position: Vector) {
  const { x, y } = position;
  if (x < 0 || y < 0) return false;
  if (x >= 2 ** 32 || y >= 2 ** 32) return false;
  return true;
}

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

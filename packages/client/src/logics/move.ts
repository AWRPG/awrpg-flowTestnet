import {
  Entity,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Vector } from "matter";
import { SOURCE } from "../constants";
import { ClientComponents } from "../mud/createClientComponents";
import { canMoveTo, getEntityOnCoord } from "./map";
import { getTerrainFromTerrainValue } from "./terrain";
import { SystemCalls } from "../mud/createSystemCalls";
import { MAX_MOVES } from "../contract/constants";
import { getReadyPosition } from "./path";

export enum Direction {
  NONE = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
}

// TODO: temp for fromPosition
export function getPositionFromPath(
  components: ClientComponents,
  role: Entity
) {
  const { Path } = components;
  const path = getComponentValue(Path, role);
  if (!path) return;
  return { x: path.toTileX, y: path.toTileY };
}

export const calculateMoves = (components: ClientComponents, role: Entity) => {
  const { TargetCoord, Path } = components;
  const targetCoordId = getComponentValue(TargetCoord, role)?.value;
  if (!targetCoordId) return;
  const targetCoord = splitFromEntity(targetCoordId);
  const sourceCoord = getPositionFromPath(components, role);
  if (!sourceCoord) return;
  // const ableCoords =
};

// set new target coord from direction
export const setNewTargetCoord = (
  components: ClientComponents,
  role: Entity,
  direction: Direction
) => {
  const coord = getNewTargetCoord(components, role, direction);
  if (!coord) return;
  setComponent(components.TargetCoord, role, {
    value: combineToEntity(coord.x, coord.y),
  });
};

// get new target coord from direction
export const getNewTargetCoord = (
  components: ClientComponents,
  role: Entity,
  direction: Direction
) => {
  const position = getPositionFromPath(components, role);
  if (!position) return;
  const targetCoordId = getComponentValue(components.TargetCoord, role)?.value;
  if (!targetCoordId) return position;
  const coord = splitFromEntity(targetCoordId);
  // TODO: check if on map
  switch (direction) {
    case Direction.UP:
      return { x: coord.x, y: coord.y - 1 };
    case Direction.DOWN:
      return { x: coord.x, y: coord.y + 1 };
    case Direction.LEFT:
      return { x: coord.x - 1, y: coord.y };
    case Direction.RIGHT:
      return { x: coord.x + 1, y: coord.y };
  }
};

export function hasPendingMoves(components: ClientComponents, role: Entity) {
  // check if unresolved moves
  const unresolvedMoves =
    getComponentValue(components.Moves, role)?.value ?? [];
  const hasMoves = unresolvedMoves.length > 0;
  return hasMoves;
}

// rename it as getEntityOnDirection?
export function getEntityOnDirection(
  components: ClientComponents,
  role: Entity
) {
  const to = getDirectionCoord(components, role);
  if (!to) return undefined;
  return getEntityOnCoord(components, to);
}

export function getBuildingOnDirection(
  components: ClientComponents,
  role: Entity
) {
  const to = getDirectionCoord(components, role);
  if (!to) return undefined;
  return getEntityOnCoord(components, to);
}

export function getTerrainOnDirection(
  components: ClientComponents,
  role: Entity
) {
  const to = getDirectionCoord(components, role);
  if (!to) return undefined;
  return getTerrainFromTerrainValue(components, to);
}

export function getDirectionCoord(components: ClientComponents, role: Entity) {
  const { Moves, RoleDirection, Position } = components;
  const moves = getComponentValue(Moves, role)?.value ?? [];
  const position = getComponentValue(Position, role);
  const direction =
    getComponentValue(RoleDirection, role)?.value ?? Direction.DOWN;
  if (!position) return undefined;
  const positions = movesToPositions([...moves, direction], {
    x: position.x,
    y: position.y,
  });
  const toPosition = positions[positions.length - 1];
  return toPosition;
}

export const updateMoves = (
  components: ClientComponents,
  systemCalls: SystemCalls,
  direction: Direction
) => {
  const { Moves, SelectedHost } = components;
  // there must be a selected host for it to start moving
  const source = getComponentValue(SelectedHost, SOURCE)?.value;
  if (!source) return;
  const moves = getComponentValue(Moves, source)?.value ?? [];
  let newMoves = [...moves];
  console.log("updateMoves", direction, moves);
  if (moves.length === 0) {
    newMoves = [direction as number];
  } else {
    const lastMove = moves[moves.length - 1];
    if (oppositeDirection(lastMove, direction)) {
      newMoves.pop();
    } else {
      newMoves.push(direction as number);
    }
  }
  const validMoves = validMovesForHost(
    components,
    systemCalls,
    source,
    newMoves
  );
  console.log("validMoves", newMoves, validMoves);
  if (!validMoves || validMoves.length === 0)
    return removeComponent(Moves, source);
  setComponent(Moves, source, { value: validMoves });
};

export const oppositeDirection = (d1: Direction, d2: Direction) => {
  return d1 + d2 === 1 || d1 + d2 === 5;
};

// assuming moves are valid
export function movesToPositions(moves: Direction[], from: Vector): Vector[] {
  if (moves.length === 0) return [from];
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
  const position = getReadyPosition(components, host);
  console.log("position", position);

  if (!position) return;
  return validMovesFrom(components, systemCalls, host, position, moves);
}

export function validMovesFrom(
  components: ClientComponents,
  systemCalls: SystemCalls,
  host: Entity,
  from: Vector,
  moves: Direction[]
): Direction[] {
  if (moves.length > MAX_MOVES) return moves.slice(0, MAX_MOVES);
  let to = from;
  const toPositions: Vector[] = [to];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    to = moveTo(move, to);
    // check loop
    const index = toPositions.findIndex((p) => p.x === to.x && p.y === to.y);
    if (index !== -1) return moves.slice(0, index);
    // check validity
    toPositions.push(to);
    if (!validMoveTo(components, systemCalls, host, to)) {
      return i === 0 ? [] : moves.slice(0, i);
    }
  }
  return moves;
}

export function validMoveTo(
  components: ClientComponents,
  systemCalls: SystemCalls,
  host: Entity,
  to: Vector
) {
  const onMap = isOnMap(to);
  const canMove = canMoveTo(components, systemCalls, host, to);
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
  return ((BigInt(x) << 128n) | BigInt(y)).toString();
}

export function combineToEntity(x: number, y: number) {
  return combine(x, y) as Entity;
}

// split one bigint into two number
export function split(xy: bigint) {
  const x = Number(xy >> 128n);
  const y = Number(xy & 0xffffffffn);
  return { x, y };
}

export function splitFromEntity(entity: Entity) {
  return split(BigInt(entity));
}

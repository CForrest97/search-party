import { Position } from "./position";
import { Bearing } from "./bearing";

const mapBearingToMovement: Record<Bearing, Position> = {
  NORTH: { x: 0, y: 1 },
  EAST: { x: 1, y: 0 },
  SOUTH: { x: 0, y: -1 },
  WEST: { x: -1, y: 0 },
} as const;

const mapBearingToRight: Record<Bearing, Bearing> = {
  NORTH: "EAST",
  EAST: "SOUTH",
  SOUTH: "WEST",
  WEST: "NORTH",
} as const;

export class Navigator {
  private position: Position = { x: 0, y: 0 };

  private bearing: Bearing = "NORTH";

  public moveForward(): void {
    const movement = mapBearingToMovement[this.bearing];

    this.position.x += movement.x;
    this.position.y += movement.y;
  }

  public turnRight(): void {
    this.bearing = mapBearingToRight[this.bearing];
  }

  public turnLeft(): void {
    this.turnRight();
    this.turnRight();
    this.turnRight();
  }

  public getPosition(): Position {
    return this.position;
  }
}

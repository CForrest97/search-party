import { Logger } from "loglevel";
import { Position } from "../domain/position";

export class PositionInvestigatorError extends Error {
  constructor(message: string, logger: Logger) {
    super(message);
    this.name = "PositionInvestigatorError";
    logger.error(message);
  }
}

export type PositionInvestigator = {
  investigatePosition: (
    position: Position
  ) => Promise<string | PositionInvestigatorError>;
};

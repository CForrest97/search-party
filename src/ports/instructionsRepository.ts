import { Logger } from "loglevel";
import { Instruction } from "../domain/instruction";

export class InstructionsRepositoryError extends Error {
  constructor(message: string, logger: Logger) {
    super(message);
    this.name = "InstructionsRepositoryError";
    logger.error(message);
  }
}

export type InstructionsRepository = {
  getInstructions: () => Promise<Instruction[] | InstructionsRepositoryError>;
};

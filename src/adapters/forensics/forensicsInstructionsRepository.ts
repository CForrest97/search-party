import { z } from "zod";
import { Logger } from "loglevel";
import { Instruction } from "../../domain/instruction";
import {
  InstructionsRepository,
  InstructionsRepositoryError,
} from "../../ports/instructionsRepository";
import { ForensicsClient } from "./forensicsClient";
import { isSchema } from "../../utils/isSchema";

const directions = ["forward", "left", "right"] as const;
const successResponseSchema = z.object({
  directions: z.array(z.enum(directions)),
});

const failureResponseSchema = z.object({
  error: z.string(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type FailureResponse = z.infer<typeof failureResponseSchema>;

const isSuccessfulResponse = isSchema(successResponseSchema);
const isFailureResponse = isSchema(failureResponseSchema);

const mapDirectionToInstruction: Record<
  (typeof directions)[number],
  Instruction
> = {
  forward: "FORWARD",
  right: "RIGHT",
  left: "LEFT",
};

export class ForensicsInstructionsRepository implements InstructionsRepository {
  private forensicsClient;

  constructor(private email: string, private logger: Logger) {
    this.forensicsClient = new ForensicsClient(email, logger);
  }

  public async getInstructions() {
    try {
      const response = await this.forensicsClient.get("directions");

      if (isSuccessfulResponse(response)) {
        return response.directions.map(
          (direction) => mapDirectionToInstruction[direction]
        );
      }

      if (isFailureResponse(response)) {
        return new InstructionsRepositoryError(response.error, this.logger);
      }

      return new InstructionsRepositoryError(
        `unexpected json response: ${JSON.stringify(response)}`,
        this.logger
      );
    } catch (error) {
      if (error instanceof Error) {
        return new InstructionsRepositoryError(
          `unexpected error: ${error.message}`,
          this.logger
        );
      }

      return new InstructionsRepositoryError(
        `unexpected error: ${error}`,
        this.logger
      );
    }
  }
}

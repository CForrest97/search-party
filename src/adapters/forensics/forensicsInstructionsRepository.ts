import { z } from "zod";
import { Logger } from "loglevel";
import { Instruction } from "../../domain/instruction";
import {
  InstructionsRepository,
  InstructionsRepositoryError,
} from "../../ports/instructionsRepository";
import { ForensicsClient } from "./forensicsClient";

const successResponseSchema = z.object({
  directions: z.array(z.enum(["forward", "left", "right"])),
});

const failureResponseSchema = z.object({
  error: z.string(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type FailureResponse = z.infer<typeof failureResponseSchema>;
type Direction = SuccessResponse["directions"][0];

const isSuccessfulResponse = (
  jsonResponse: unknown
): jsonResponse is SuccessResponse =>
  successResponseSchema.safeParse(jsonResponse).success;

const isFailureResponse = (
  jsonResponse: unknown
): jsonResponse is FailureResponse =>
  failureResponseSchema.safeParse(jsonResponse).success;

export class ForensicsInstructionsRepository implements InstructionsRepository {
  private forensicsClient;

  constructor(private email: string, private logger: Logger) {
    this.forensicsClient = new ForensicsClient(email, logger);
  }

  private static mapDirectionToInstruction: Record<Direction, Instruction> = {
    forward: "FORWARD",
    right: "RIGHT",
    left: "LEFT",
  };

  public async getInstructions() {
    try {
      const response = await this.forensicsClient.get(`directions`);

      if (isSuccessfulResponse(response)) {
        return response.directions.map(
          (direction) =>
            ForensicsInstructionsRepository.mapDirectionToInstruction[direction]
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

import { z } from "zod";
import { Logger } from "loglevel";
import {
  PositionInvestigator,
  PositionInvestigatorError,
} from "../../ports/positionInvestigator";
import { Position } from "../../domain/position";
import { ForensicsClient } from "./forensicsClient";

const successResponseSchema = z.object({
  message: z.string(),
});

const failureResponseSchema = z.object({
  error: z.string(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type FailureResponse = z.infer<typeof failureResponseSchema>;

const isSuccessfulResponse = (
  jsonResponse: unknown
): jsonResponse is SuccessResponse =>
  successResponseSchema.safeParse(jsonResponse).success;

const isFailureResponse = (
  jsonResponse: unknown
): jsonResponse is FailureResponse =>
  failureResponseSchema.safeParse(jsonResponse).success;

export class ForensicsPositionInvestigator implements PositionInvestigator {
  private forensicsClient;

  constructor(private email: string, private logger: Logger) {
    this.forensicsClient = new ForensicsClient(email, logger);
  }

  public async investigatePosition(position: Position) {
    try {
      const response = await this.forensicsClient.get(
        `location/${position.x}/${position.y}`
      );

      if (isSuccessfulResponse(response)) {
        return response.message;
      }

      if (isFailureResponse(response)) {
        return new PositionInvestigatorError(response.error, this.logger);
      }

      return new PositionInvestigatorError(
        `unexpected json response: ${JSON.stringify(response)}`,
        this.logger
      );
    } catch (error) {
      if (error instanceof Error) {
        return new PositionInvestigatorError(
          `unexpected error: ${error.message}`,
          this.logger
        );
      }

      return new PositionInvestigatorError(
        `unexpected error: ${error}`,
        this.logger
      );
    }
  }
}

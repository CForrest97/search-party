import * as fetch from "node-fetch";
import { mock } from "jest-mock-extended";
import { Response } from "node-fetch";
import {
  FailureResponse,
  ForensicsInstructionsRepository,
  SuccessResponse,
} from "../../../../src/adapters/forensics/forensicsInstructionsRepository";
import { InstructionsRepositoryError } from "../../../../src/ports/instructionsRepository";
import { silentLogger } from "../../../helpers/silentLogger";

const arrangeTest = (response?: SuccessResponse | FailureResponse) => {
  const mockResponse = mock<Response>();
  const spyOnFetch = jest
    .spyOn(fetch, "default")
    .mockResolvedValue(mockResponse);

  mockResponse.json.mockResolvedValue(response);

  const email = "fake@email.com";
  const forensicsInstructionsRepository = new ForensicsInstructionsRepository(
    email,
    silentLogger
  );

  return {
    getInstructions: () => forensicsInstructionsRepository.getInstructions(),
    email,
    mockResponse,
    spyOnFetch,
  };
};

describe("ForensicsInstructionsRepository", () => {
  it("should get the instructions from the forensics API", async () => {
    const { getInstructions, email, spyOnFetch } = arrangeTest({
      directions: ["forward", "right", "left"],
    });

    const instructions = await getInstructions();

    expect(spyOnFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/${email}/directions`)
    );
    expect(instructions).toEqual<typeof instructions>([
      "FORWARD",
      "RIGHT",
      "LEFT",
    ]);
  });

  it("should handle the failure case", async () => {
    const { getInstructions } = arrangeTest({
      error: "example error message",
    });

    const error = await getInstructions();

    expect(error).toBeInstanceOf(InstructionsRepositoryError);
    expect((error as InstructionsRepositoryError).message).toEqual(
      "example error message"
    );
  });

  it("should handle unexpected responses from the forensics api", async () => {
    const { getInstructions } = arrangeTest(
      "this is not an expected response" as any
    );

    const error = await getInstructions();

    expect(error).toBeInstanceOf(InstructionsRepositoryError);
    expect((error as InstructionsRepositoryError).message).toEqual(
      "unexpected response: this is not an expected response"
    );
  });

  it("should handle errors being thrown", async () => {
    const { getInstructions, mockResponse } = arrangeTest();
    mockResponse.json.mockRejectedValue(new Error("error from json"));

    const error = await getInstructions();

    expect(error).toBeInstanceOf(InstructionsRepositoryError);
    expect((error as InstructionsRepositoryError).message).toEqual(
      "unexpected error: error from json"
    );
  });
});

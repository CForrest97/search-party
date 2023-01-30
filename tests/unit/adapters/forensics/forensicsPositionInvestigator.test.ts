import * as fetch from "node-fetch";
import { Response } from "node-fetch";
import { mock } from "jest-mock-extended";
import {
  FailureResponse,
  ForensicsPositionInvestigator,
  SuccessResponse,
} from "../../../../src/adapters/forensics/forensicsPositionInvestigator";
import { Position } from "../../../../src/domain/position";
import { PositionInvestigatorError } from "../../../../src/ports/positionInvestigator";
import { silentLogger } from "../../../helpers/silentLogger";

const arrangeTest = (response?: SuccessResponse | FailureResponse) => {
  const mockResponse = mock<Response>();
  const spyOnFetch = jest
    .spyOn(fetch, "default")
    .mockResolvedValue(mockResponse);

  mockResponse.json.mockResolvedValue(response);

  const email = "fake@email.com";
  const forensicsInstructionsRepository = new ForensicsPositionInvestigator(
    email,
    silentLogger
  );

  return {
    investigatePosition: (position: Position) =>
      forensicsInstructionsRepository.investigatePosition(position),
    email,
    mockResponse,
    spyOnFetch,
  };
};

describe("ForensicsPositionInvestigator", () => {
  it("should investigate the position with forensics API", async () => {
    const { investigatePosition, email, spyOnFetch } = arrangeTest({
      message: "test message",
    });

    const positionValidation = await investigatePosition({ x: 4, y: 5 });

    expect(spyOnFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/${email}/location/4/5`)
    );
    expect(positionValidation).toEqual("test message");
  });

  it("should handle the failure case", async () => {
    const { investigatePosition } = arrangeTest({
      error: "example error message",
    });

    const error = await investigatePosition({ x: 0, y: 0 });

    expect(error).toBeInstanceOf(PositionInvestigatorError);
    expect((error as PositionInvestigatorError).message).toEqual(
      "example error message"
    );
  });

  it("should handle unexpected json responses from the forensics api", async () => {
    const { investigatePosition } = arrangeTest({
      thisIs: "an unexpected response from the forensics API",
    } as any);

    const error = await investigatePosition({ x: 0, y: 0 });

    expect(error).toBeInstanceOf(PositionInvestigatorError);
    expect((error as PositionInvestigatorError).message).toEqual(
      'unexpected json response: {"thisIs":"an unexpected response from the forensics API"}'
    );
  });

  it("should handle errors being thrown", async () => {
    const { investigatePosition, mockResponse } = arrangeTest();
    mockResponse.json.mockRejectedValue(new Error("error from json"));

    const error = await investigatePosition({ x: 0, y: 0 });

    expect(error).toBeInstanceOf(PositionInvestigatorError);
    expect((error as PositionInvestigatorError).message).toEqual(
      "unexpected error: error from json"
    );
  });
});

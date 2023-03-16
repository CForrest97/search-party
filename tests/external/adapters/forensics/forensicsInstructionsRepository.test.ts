import { ForensicsInstructionsRepository } from "../../../../src/adapters/forensics/forensicsInstructionsRepository";
import { InstructionsRepositoryError } from "../../../../src/ports/instructionsRepository";
import { silentLogger } from "../../../helpers/silentLogger";

describe("ForensicsInstructionsRepository", () => {
  it("should get the instructions from the forensics API", async () => {
    const email = "fake@email.com";
    const forensicsInstructionsRepository = new ForensicsInstructionsRepository(
      email,
      silentLogger
    );

    const instructions =
      await forensicsInstructionsRepository.getInstructions();

    expect(instructions).toEqual([
      "FORWARD",
      "RIGHT",
      "FORWARD",
      "FORWARD",
      "FORWARD",
      "LEFT",
      "FORWARD",
      "FORWARD",
      "LEFT",
      "RIGHT",
      "FORWARD",
      "RIGHT",
      "FORWARD",
      "FORWARD",
      "RIGHT",
      "FORWARD",
      "FORWARD",
      "LEFT",
    ]);
  });

  it("should handle an invalid email address", async () => {
    const forensicsInstructionsRepository = new ForensicsInstructionsRepository(
      "invalid-email",
      silentLogger
    );

    const instructions =
      await forensicsInstructionsRepository.getInstructions();

    expect(instructions).toBeInstanceOf(InstructionsRepositoryError);
    expect((instructions as InstructionsRepositoryError).message).toEqual(
      "Invalid email address: 'invalid-email'"
    );
  });
});

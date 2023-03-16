import { ForensicsPositionInvestigator } from "../../../../src/adapters/forensics/forensicsPositionInvestigator";
import { generateUniqueEmail } from "../../../helpers/generateUniqueEmail";
import { silentLogger } from "../../../helpers/silentLogger";

describe("ForensicsInstructionsRepository", () => {
  it("should validate that the kittens are at (x=5, y=2)", async () => {
    const email = generateUniqueEmail();
    const forensicsPositionValidator = new ForensicsPositionInvestigator(
      email,
      silentLogger
    );

    const message = await forensicsPositionValidator.investigatePosition({
      x: 5,
      y: 2,
    });

    expect(message).toEqual(
      "Congratulations! The search party successfully recovered the missing kittens.Please push your code to github and send the url to michael.kidd@which.co.uk"
    );
  });

  it("should handle investigating at the wrong position", async () => {
    const email = generateUniqueEmail();
    const forensicsPositionValidator = new ForensicsPositionInvestigator(
      email,
      silentLogger
    );

    const message = await forensicsPositionValidator.investigatePosition({
      x: 1,
      y: 1,
    });

    expect(message).toEqual(
      "Unfortunately, the search party failed to recover the missing kittens. You have 4 attempts remaining."
    );
  });
});

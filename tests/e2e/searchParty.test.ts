import { ForensicsInstructionsRepository } from "../../src/adapters/forensics/forensicsInstructionsRepository";
import { SearchParty } from "../../src/useCases/searchParty";
import { ForensicsPositionInvestigator } from "../../src/adapters/forensics/forensicsPositionInvestigator";
import { generateUniqueEmail } from "../helpers/generateUniqueEmail";
import { silentLogger } from "../helpers/silentLogger";

describe("SearchParty", () => {
  it("should locate the position of the missing kittens", async () => {
    const email = generateUniqueEmail();
    const searchParty = new SearchParty(
      new ForensicsInstructionsRepository(email, silentLogger),
      new ForensicsPositionInvestigator(email, silentLogger)
    );

    const investigationMessage = await searchParty.locateKittens();

    expect(investigationMessage).toEqual(
      "Congratulations! The search party successfully recovered the missing kittens.Please push your code to github and send the url to michael.kidd@which.co.uk"
    );
  });
});

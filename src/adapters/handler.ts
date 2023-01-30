import logger from "loglevel";
import { SearchParty } from "../useCases/searchParty";
import { ForensicsInstructionsRepository } from "./forensics/forensicsInstructionsRepository";
import { ForensicsPositionInvestigator } from "./forensics/forensicsPositionInvestigator";

const handler = async () => {
  const email = "my@email.com";
  logger.setLevel("info");

  const searchParty = new SearchParty(
    new ForensicsInstructionsRepository(email, logger),
    new ForensicsPositionInvestigator(email, logger)
  );

  const investigationMessage = await searchParty.locateKittens();

  logger.info(investigationMessage);
  return investigationMessage;
};

handler();

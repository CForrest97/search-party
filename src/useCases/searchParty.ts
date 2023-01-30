import {
  InstructionsRepository,
  InstructionsRepositoryError,
} from "../ports/instructionsRepository";
import {
  PositionInvestigator,
  PositionInvestigatorError,
} from "../ports/positionInvestigator";
import { Navigator } from "../domain/navigator";

export class SearchParty {
  constructor(
    private instructionsRepository: InstructionsRepository,
    private positionInvestigator: PositionInvestigator
  ) {}

  public async locateKittens(): Promise<
    string | InstructionsRepositoryError | PositionInvestigatorError
  > {
    const instructions = await this.instructionsRepository.getInstructions();

    if (instructions instanceof InstructionsRepositoryError) {
      return instructions;
    }

    const navigator = new Navigator();
    instructions.forEach((instruction) => {
      if (instruction === "FORWARD") {
        navigator.moveForward();
      } else if (instruction === "RIGHT") {
        navigator.turnRight();
      } else {
        navigator.turnLeft();
      }
    });

    return this.positionInvestigator.investigatePosition(
      navigator.getPosition()
    );
  }
}

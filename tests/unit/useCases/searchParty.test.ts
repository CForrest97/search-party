import { mock } from "jest-mock-extended";
import { SearchParty } from "../../../src/useCases/searchParty";
import {
  InstructionsRepository,
  InstructionsRepositoryError,
} from "../../../src/ports/instructionsRepository";
import {
  PositionInvestigator,
  PositionInvestigatorError,
} from "../../../src/ports/positionInvestigator";
import ResolvedValue = jest.ResolvedValue;
import { silentLogger } from "../../helpers/silentLogger";

const arrangeTest = (
  instructions: ResolvedValue<
    ReturnType<InstructionsRepository["getInstructions"]>
  >,
  investigationMessage: ResolvedValue<
    ReturnType<PositionInvestigator["investigatePosition"]>
  > = ""
) => {
  const instructionsRepository = mock<InstructionsRepository>();
  const positionInvestigator = mock<PositionInvestigator>();

  instructionsRepository.getInstructions.mockResolvedValue(instructions);
  positionInvestigator.investigatePosition.mockResolvedValue(
    investigationMessage
  );

  const searchParty = new SearchParty(
    instructionsRepository,
    positionInvestigator
  );

  return {
    locateKittens: () => searchParty.locateKittens(),
    positionInvestigator,
  };
};

describe("SearchParty", () => {
  describe("given the kittens are at the starting location", () => {
    it("should find the kittens at [0.0]", async () => {
      const { locateKittens, positionInvestigator } = arrangeTest(
        [],
        "investigation response message"
      );

      const kittensPosition = await locateKittens();

      expect(kittensPosition).toEqual("investigation response message");
      expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith({
        x: 0,
        y: 0,
      });
    });
  });

  describe("moving forward", () => {
    it.each`
      instructions                                    | expectedPosition
      ${["FORWARD"]}                                  | ${{ x: 0, y: 1 }}
      ${["FORWARD", "FORWARD"]}                       | ${{ x: 0, y: 2 }}
      ${["FORWARD", "FORWARD", "FORWARD"]}            | ${{ x: 0, y: 3 }}
      ${["FORWARD", "FORWARD", "FORWARD", "FORWARD"]} | ${{ x: 0, y: 4 }}
    `(
      "should find the kittens after moving $instructions",
      async ({ instructions, expectedPosition }) => {
        const { locateKittens, positionInvestigator } =
          arrangeTest(instructions);

        await locateKittens();

        expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith(
          expectedPosition
        );
      }
    );
  });

  describe("turning right then moving", () => {
    it.each`
      instructions                                       | expectedPosition
      ${["RIGHT"]}                                       | ${{ x: 0, y: 0 }}
      ${["RIGHT", "FORWARD"]}                            | ${{ x: 1, y: 0 }}
      ${["RIGHT", "RIGHT", "FORWARD"]}                   | ${{ x: 0, y: -1 }}
      ${["RIGHT", "RIGHT", "RIGHT", "FORWARD"]}          | ${{ x: -1, y: 0 }}
      ${["RIGHT", "RIGHT", "RIGHT", "RIGHT", "FORWARD"]} | ${{ x: 0, y: 1 }}
    `(
      "should find the kittens after moving $instructions",
      async ({ instructions, expectedPosition }) => {
        const { locateKittens, positionInvestigator } =
          arrangeTest(instructions);

        await locateKittens();

        expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith(
          expectedPosition
        );
      }
    );
  });

  describe("turning left then moving", () => {
    it.each`
      instructions                                   | expectedPosition
      ${["LEFT"]}                                    | ${{ x: 0, y: 0 }}
      ${["LEFT", "FORWARD"]}                         | ${{ x: -1, y: 0 }}
      ${["LEFT", "LEFT", "FORWARD"]}                 | ${{ x: 0, y: -1 }}
      ${["LEFT", "LEFT", "LEFT", "FORWARD"]}         | ${{ x: 1, y: 0 }}
      ${["LEFT", "LEFT", "LEFT", "LEFT", "FORWARD"]} | ${{ x: 0, y: 1 }}
    `(
      "should find the kittens after moving $instructions",
      async ({ instructions, expectedPosition }) => {
        const { locateKittens, positionInvestigator } =
          arrangeTest(instructions);

        await locateKittens();

        expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith(
          expectedPosition
        );
      }
    );
  });

  it("should handle an error from the instructions repository", async () => {
    const error = new InstructionsRepositoryError(
      "example error fetching instructions",
      silentLogger
    );
    const { locateKittens } = arrangeTest(error);

    const kittensPosition = await locateKittens();

    expect(kittensPosition).toEqual(error);
  });

  it("should handle an error from the position investigator", async () => {
    const error = new PositionInvestigatorError(
      "example error fetching instructions",
      silentLogger
    );
    const { locateKittens } = arrangeTest([], error);

    const kittensPosition = await locateKittens();

    expect(kittensPosition).toEqual(error);
  });

  it("should navigate the kittens along a complex path", async () => {
    const { locateKittens, positionInvestigator } = arrangeTest([
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

    await locateKittens();

    expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith({
      x: 5,
      y: 2,
    });
  });
});

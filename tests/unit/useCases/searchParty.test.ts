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
import { Position } from "../../../src/domain/position";

const arrangeTest = (
  instructions: ResolvedValue<
    ReturnType<InstructionsRepository["getInstructions"]>
  >,
  investigationMessage: ResolvedValue<
    ReturnType<PositionInvestigator["investigatePosition"]>
  > = "mocked investigation message response"
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

  const assertPositionInvestigatedAt = (position: Position) =>
    expect(positionInvestigator.investigatePosition).toHaveBeenCalledWith(
      position
    );

  return {
    locateKittens: () => searchParty.locateKittens(),
    assertPositionInvestigatedAt,
  };
};

describe("SearchParty", () => {
  describe("given the kittens are at the starting location", () => {
    it("should find the kittens at (x=0, y=0)", async () => {
      const { locateKittens, assertPositionInvestigatedAt } = arrangeTest(
        [],
        "investigation response message"
      );

      const kittensPosition = await locateKittens();

      expect(kittensPosition).toEqual("investigation response message");
      assertPositionInvestigatedAt({
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
        const { locateKittens, assertPositionInvestigatedAt } =
          arrangeTest(instructions);

        await locateKittens();

        assertPositionInvestigatedAt(expectedPosition);
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
        const { locateKittens, assertPositionInvestigatedAt } =
          arrangeTest(instructions);

        await locateKittens();

        assertPositionInvestigatedAt(expectedPosition);
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
        const { locateKittens, assertPositionInvestigatedAt } =
          arrangeTest(instructions);

        await locateKittens();

        assertPositionInvestigatedAt(expectedPosition);
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

  it("should navigate along a complex path", async () => {
    const { locateKittens, assertPositionInvestigatedAt } = arrangeTest([
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

    assertPositionInvestigatedAt({
      x: 5,
      y: 2,
    });
  });
});

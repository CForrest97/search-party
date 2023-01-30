import { mock } from "jest-mock-extended";
import { Logger } from "loglevel";

export const silentLogger = mock<Logger>();

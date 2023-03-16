import { z } from "zod";

export const isSchema =
  <T>(schema: z.Schema<T>) =>
  (data: unknown): data is T =>
    schema.safeParse(data).success;

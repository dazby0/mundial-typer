import { z } from "zod";

export const resultSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(30),
  awayScore: z.number().int().min(0).max(30),
});

export type ResultInput = z.infer<typeof resultSchema>;

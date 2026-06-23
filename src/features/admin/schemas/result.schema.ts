import { z } from "zod";

export const resultSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  winnerTeamId: z.string().uuid().nullable().optional(),
  resolutionMethod: z.enum(["in_match", "penalties"]).nullable().optional(),
  homePenaltyScore: z.number().int().min(0).nullable().optional(),
  awayPenaltyScore: z.number().int().min(0).nullable().optional(),
});

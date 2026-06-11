import { z } from "zod";

export const predictionSchema = z.object({
  matchId: z.string().uuid(),
  predictedHomeScore: z.number().int().min(0).max(30),
  predictedAwayScore: z.number().int().min(0).max(30),
});

export type PredictionInput = z.infer<typeof predictionSchema>;

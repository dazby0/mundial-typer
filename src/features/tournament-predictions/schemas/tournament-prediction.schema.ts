import { z } from "zod";

const teamIdSchema = z.string().uuid("Wybierz drużynę.");

export const tournamentPredictionSchema = z
  .object({
    champion_team_id: teamIdSchema,
    finalist_team_1_id: teamIdSchema,
    finalist_team_2_id: teamIdSchema,
    semifinalist_team_1_id: teamIdSchema,
    semifinalist_team_2_id: teamIdSchema,
    semifinalist_team_3_id: teamIdSchema,
    semifinalist_team_4_id: teamIdSchema,
    top_scorer_name: z
      .string()
      .trim()
      .min(2, "Wpisz króla strzelców.")
      .max(80, "Nazwisko jest za długie."),
    top_scoring_team_id: teamIdSchema,
  })
  .superRefine((data, ctx) => {
    const finalists = [data.finalist_team_1_id, data.finalist_team_2_id];
    const semifinalists = [
      data.semifinalist_team_1_id,
      data.semifinalist_team_2_id,
      data.semifinalist_team_3_id,
      data.semifinalist_team_4_id,
    ];

    if (data.finalist_team_1_id === data.finalist_team_2_id) {
      ctx.addIssue({
        code: "custom",
        path: ["finalist_team_2_id"],
        message: "Finaliści muszą być różni.",
      });
    }

    if (!finalists.includes(data.champion_team_id)) {
      ctx.addIssue({
        code: "custom",
        path: ["champion_team_id"],
        message: "Mistrz musi być jednym z finalistów.",
      });
    }

    if (new Set(semifinalists).size !== semifinalists.length) {
      ctx.addIssue({
        code: "custom",
        path: ["semifinalist_team_4_id"],
        message: "TOP 4 musi zawierać cztery różne drużyny.",
      });
    }

    const finalistOutsideTop4 = finalists.some(
      (finalistId) => !semifinalists.includes(finalistId),
    );

    if (finalistOutsideTop4) {
      ctx.addIssue({
        code: "custom",
        path: ["semifinalist_team_1_id"],
        message: "Finaliści muszą znajdować się w TOP 4.",
      });
    }
  });

export const tournamentBonusResultSchema = tournamentPredictionSchema.extend({
  is_finalized: z.boolean(),
});

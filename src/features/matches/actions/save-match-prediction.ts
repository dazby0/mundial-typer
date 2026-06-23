"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import {
  KnockoutPredictionPayload,
  SavePredictionPayload,
} from "@/src/features/matches/types/match.types";
import {
  isKnockoutStage,
  validateKnockoutPrediction,
} from "@/src/features/knockout/utils/knockout-rules";
import { KnockoutResolutionMethod } from "../../knockout/types/knockout-rules.types";

type SaveMatchPredictionResult = {
  success: boolean;
  message: string;
};

type PredictionUpsertPayload = {
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner_team_id: string | null;
  predicted_resolution_method: KnockoutResolutionMethod | null;
  updated_at: string;
};

function isValidScore(value: number) {
  return Number.isInteger(value) && value >= 0;
}

function isKnockoutPredictionPayload(
  payload: SavePredictionPayload,
): payload is KnockoutPredictionPayload {
  return (
    "predictedWinnerTeamId" in payload && "predictedResolutionMethod" in payload
  );
}

export async function saveMatchPredictionAction(
  payload: SavePredictionPayload,
): Promise<SaveMatchPredictionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Musisz być zalogowany, żeby zapisać typ.",
    };
  }

  if (
    !isValidScore(payload.predictedHomeScore) ||
    !isValidScore(payload.predictedAwayScore)
  ) {
    return {
      success: false,
      message: "Wynik musi być liczbą całkowitą większą lub równą 0.",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches_view")
    .select(
      `
      id,
      kickoff_time,
      stage,
      status,
      home_team_id,
      away_team_id
    `,
    )
    .eq("id", payload.matchId)
    .single();

  if (matchError || !match) {
    return {
      success: false,
      message: "Nie udało się znaleźć meczu.",
    };
  }

  if (match.status !== "scheduled") {
    return {
      success: false,
      message: "Nie można już typować tego meczu.",
    };
  }

  if (new Date(match.kickoff_time).getTime() <= Date.now()) {
    return {
      success: false,
      message: "Mecz już się rozpoczął. Typowanie jest zamknięte.",
    };
  }

  const isKnockoutMatch = isKnockoutStage(match.stage);

  if (isKnockoutMatch && !isKnockoutPredictionPayload(payload)) {
    return {
      success: false,
      message:
        "Dla fazy pucharowej musisz wybrać drużynę awansującą i sposób awansu.",
    };
  }

  if (!isKnockoutMatch && isKnockoutPredictionPayload(payload)) {
    return {
      success: false,
      message: "Ten mecz nie jest meczem fazy pucharowej.",
    };
  }

  if (isKnockoutMatch && isKnockoutPredictionPayload(payload)) {
    const validation = validateKnockoutPrediction({
      homeTeamId: match.home_team_id,
      awayTeamId: match.away_team_id,
      homeScore: payload.predictedHomeScore,
      awayScore: payload.predictedAwayScore,
      predictedWinnerTeamId: payload.predictedWinnerTeamId,
      predictedResolutionMethod: payload.predictedResolutionMethod,
    });

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors[0] || "Niepoprawny typ fazy pucharowej.",
      };
    }
  }

  const predictionPayload: PredictionUpsertPayload = {
    user_id: user.id,
    match_id: payload.matchId,
    predicted_home_score: payload.predictedHomeScore,
    predicted_away_score: payload.predictedAwayScore,
    predicted_winner_team_id:
      isKnockoutMatch && isKnockoutPredictionPayload(payload)
        ? payload.predictedWinnerTeamId
        : null,
    predicted_resolution_method:
      isKnockoutMatch && isKnockoutPredictionPayload(payload)
        ? payload.predictedResolutionMethod
        : null,
    updated_at: new Date().toISOString(),
  };

  const { error: predictionError } = await supabase
    .from("predictions")
    .upsert(predictionPayload, {
      onConflict: "user_id,match_id",
    });

  if (predictionError) {
    return {
      success: false,
      message: predictionError.message,
    };
  }

  revalidatePath(`/matches/${payload.matchId}`);
  revalidatePath("/matches");
  revalidatePath("/predictions");
  revalidatePath("/ranking");

  return {
    success: true,
    message: "Twój typ został zapisany. VAR przybił pieczątkę.",
  };
}

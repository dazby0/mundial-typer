import { QualificationStatus } from "@/src/features/groups/types/group-standing.types";

export function getQualificationRowClass(status: QualificationStatus) {
  if (status === "qualified_top_two") {
    return "bg-primary/10";
  }

  if (status === "qualified_third_place") {
    return "bg-yellow-100";
  }

  return "bg-white";
}

export function getThirdPlaceRowClass(thirdPlaceRank: number | null) {
  if (thirdPlaceRank && thirdPlaceRank <= 8) {
    return "bg-yellow-100";
  }

  return "bg-white opacity-70";
}

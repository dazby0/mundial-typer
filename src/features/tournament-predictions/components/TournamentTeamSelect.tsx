"use client";

import { TournamentTeamOption } from "@/src/features/tournament-predictions/types/tournament-prediction.types";

type TournamentTeamSelectProps = {
  label: string;
  value: string;
  teams: TournamentTeamOption[];
  onChange: (value: string) => void;
};

export function TournamentTeamSelect({
  label,
  value,
  teams,
  onChange,
}: TournamentTeamSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-input bg-white px-4 text-sm outline-none transition focus:border-primary"
      >
        <option value="">Wybierz drużynę</option>

        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name_pl} ({team.code})
          </option>
        ))}
      </select>
    </label>
  );
}

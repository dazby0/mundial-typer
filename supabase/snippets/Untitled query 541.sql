select
  match_code,
  round_key,
  home_slot_label,
  away_slot_label,
  home_team_name_pl,
  away_team_name_pl,
  match_id,
  status,
  home_score,
  away_score,
  winner_team_name_pl,
  resolution_method
from public.knockout_bracket_view
order by round_order, match_order;
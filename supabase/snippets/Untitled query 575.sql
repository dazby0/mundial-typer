begin;

delete from public.predictions
where match_id in (
  select match_id
  from public.knockout_matches_preview
  where match_id is not null
);

delete from public.matches
where id in (
  select match_id
  from public.knockout_matches_preview
  where match_id is not null
);

update public.knockout_matches_preview
set
  home_team_id = null,
  away_team_id = null,
  match_id = null,
  is_confirmed = false,
  confirmed_at = null,
  confirmed_by = null,
  prediction_status = 'locked',
  updated_at = now();

commit;
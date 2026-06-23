create or replace function public.resolve_round_of_32_slot_for_test(
  p_match_code text,
  p_slot_side text,
  p_slot_label text,
  p_selections jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  slot_group_letter text;
  slot_position integer;
  selected_team_id uuid;
  allowed_group_letters text[];
begin
  if p_slot_label ~ '^[A-L][12]$' then
    slot_group_letter := substring(p_slot_label from 1 for 1);
    slot_position := substring(p_slot_label from 2 for 1)::integer;

    select gq.team_id
    into selected_team_id
    from public.group_qualification_view gq
    where gq.group_name = 'Group ' || slot_group_letter
      and gq.group_position = slot_position
    limit 1;

    if selected_team_id is null then
      raise exception 'Could not resolve automatic slot % for match %.', p_slot_label, p_match_code;
    end if;

    return selected_team_id;
  end if;

  if p_slot_label like '%3%' then
    select (item ->> 'team_id')::uuid
    into selected_team_id
    from jsonb_array_elements(p_selections) item
    where item ->> 'match_code' = p_match_code
      and item ->> 'slot_side' = p_slot_side
    limit 1;

    if selected_team_id is null then
      raise exception 'Missing third-place selection for match %, slot %.', p_match_code, p_slot_side;
    end if;

    allowed_group_letters := array(
      select replace(value, '3', '')
      from regexp_split_to_table(p_slot_label, '/') value
    );

    perform 1
    from public.group_qualification_view gq
    where gq.team_id = selected_team_id
      and gq.group_position = 3
      and replace(gq.group_name, 'Group ', '') = any(allowed_group_letters);

    if not found then
      raise exception 'Invalid third-place selection for match %, slot %.', p_match_code, p_slot_side;
    end if;

    return selected_team_id;
  end if;

  raise exception 'Unsupported slot label % for match %.', p_slot_label, p_match_code;
end;
$$;

create or replace function public.confirm_round_of_32_bracket_test_mode(
  third_place_selections jsonb
)
returns table (
  confirmed_match_code text,
  created_match_id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  preview_match record;
  resolved_home_team_id uuid;
  resolved_away_team_id uuid;
  inserted_match_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can confirm the knockout bracket in test mode.';
  end if;

  if jsonb_typeof(third_place_selections) <> 'array' then
    raise exception 'third_place_selections must be a JSON array.';
  end if;

  if exists (
    select 1
    from public.knockout_matches_preview
    where round_key = 'round_of_32'
      and match_id is not null
  ) then
    raise exception 'Round of 32 bracket is already confirmed.';
  end if;

  create temporary table resolved_round_of_32_matches (
    match_code text primary key,
    match_order integer not null,
    home_team_id uuid not null,
    away_team_id uuid not null
  ) on commit drop;

  for preview_match in
    select *
    from public.knockout_matches_preview
    where round_key = 'round_of_32'
    order by match_order
  loop
    resolved_home_team_id := public.resolve_round_of_32_slot_for_test(
      preview_match.match_code,
      'home',
      preview_match.home_slot_label,
      third_place_selections
    );

    resolved_away_team_id := public.resolve_round_of_32_slot_for_test(
      preview_match.match_code,
      'away',
      preview_match.away_slot_label,
      third_place_selections
    );

    if resolved_home_team_id = resolved_away_team_id then
      raise exception 'Match % has the same team on both sides.', preview_match.match_code;
    end if;

    insert into resolved_round_of_32_matches (
      match_code,
      match_order,
      home_team_id,
      away_team_id
    )
    values (
      preview_match.match_code,
      preview_match.match_order,
      resolved_home_team_id,
      resolved_away_team_id
    );
  end loop;

  if exists (
    select team_id
    from (
      select home_team_id as team_id
      from resolved_round_of_32_matches

      union all

      select away_team_id as team_id
      from resolved_round_of_32_matches
    ) teams
    group by team_id
    having count(*) > 1
  ) then
    raise exception 'The Round of 32 bracket contains duplicated teams.';
  end if;

  for preview_match in
    select
      kmp.*,
      resolved.home_team_id as resolved_home_team_id,
      resolved.away_team_id as resolved_away_team_id
    from public.knockout_matches_preview kmp
    join resolved_round_of_32_matches resolved
      on resolved.match_code = kmp.match_code
    where kmp.round_key = 'round_of_32'
    order by kmp.match_order
  loop
    insert into public.matches (
      home_team_id,
      away_team_id,
      kickoff_time,
      stage,
      group_name,
      matchday,
      home_score,
      away_score,
      status,
      match_number,
      venue_city_en,
      venue_city_pl,
      match_code,
      round_label
    )
    values (
      preview_match.resolved_home_team_id,
      preview_match.resolved_away_team_id,
      preview_match.kickoff_time,
      preview_match.round_key::match_stage,
      null,
      null,
      null,
      null,
      'scheduled'::match_status,
      72 + preview_match.match_order,
      preview_match.venue_city,
      preview_match.venue_label,
      preview_match.match_code,
      preview_match.round_label
    )
    returning id into inserted_match_id;

    update public.knockout_matches_preview
    set
      home_team_id = preview_match.resolved_home_team_id,
      away_team_id = preview_match.resolved_away_team_id,
      match_id = inserted_match_id,
      is_confirmed = true,
      confirmed_at = now(),
      confirmed_by = auth.uid(),
      prediction_status = 'open',
      updated_at = now()
    where id = preview_match.id;

    confirmed_match_code := preview_match.match_code;
    created_match_id := inserted_match_id;

    return next;
  end loop;
end;
$$;

grant execute on function public.resolve_round_of_32_slot_for_test(text, text, text, jsonb) to authenticated;
grant execute on function public.confirm_round_of_32_bracket_test_mode(jsonb) to authenticated;
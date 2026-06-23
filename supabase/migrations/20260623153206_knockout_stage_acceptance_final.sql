SET check_function_bodies = false;
CREATE OR REPLACE FUNCTION public.advance_knockout_result(p_match_id uuid)
 RETURNS TABLE(target_match_code text, target_slot text, advanced_team_id uuid, created_match_id uuid)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  source_preview record;
  source_match record;
  link_record record;
  target_preview record;
  team_to_advance uuid;
  target_match_id uuid;
  generated_match_number integer;
begin
  if not public.is_admin() then
    raise exception 'Only admins can advance knockout results.';
  end if;

  select
    kmp.id,
    kmp.match_code
  into source_preview
  from public.knockout_matches_preview kmp
  where kmp.match_id = p_match_id;

  if source_preview.id is null then
    return;
  end if;

  select
    m.id,
    m.stage,
    m.status,
    m.home_team_id,
    m.away_team_id,
    m.winner_team_id
  into source_match
  from public.matches m
  where m.id = p_match_id;

  if source_match.id is null then
    return;
  end if;

  if source_match.status <> 'finished'::match_status then
    return;
  end if;

  if source_match.winner_team_id is null then
    return;
  end if;

  for link_record in
    select
      kml.target_match_code,
      kml.target_slot,
      kml.source_result
    from public.knockout_match_links kml
    where kml.source_match_code = source_preview.match_code
  loop
    if link_record.source_result = 'winner' then
      team_to_advance := source_match.winner_team_id;
    else
      team_to_advance := case
        when source_match.winner_team_id = source_match.home_team_id then source_match.away_team_id
        else source_match.home_team_id
      end;
    end if;

    select
      kmp.*
    into target_preview
    from public.knockout_matches_preview kmp
    where kmp.match_code = link_record.target_match_code
    for update;

    if target_preview.id is null then
      continue;
    end if;

    if target_preview.match_id is not null then
      perform 1
      from public.matches m
      where m.id = target_preview.match_id
        and m.status = 'finished'::match_status;

      if found then
        raise exception
          'Cannot update %, because target match % is already finished.',
          source_preview.match_code,
          target_preview.match_code;
      end if;
    end if;

    if link_record.target_slot = 'home' then
      update public.knockout_matches_preview
      set
        home_team_id = team_to_advance,
        updated_at = now()
      where match_code = link_record.target_match_code;
    else
      update public.knockout_matches_preview
      set
        away_team_id = team_to_advance,
        updated_at = now()
      where match_code = link_record.target_match_code;
    end if;

    select
      kmp.*
    into target_preview
    from public.knockout_matches_preview kmp
    where kmp.match_code = link_record.target_match_code
    for update;

    if target_preview.match_id is not null then
      if link_record.target_slot = 'home' then
        update public.matches
        set
          home_team_id = team_to_advance,
          updated_at = now()
        where id = target_preview.match_id;
      else
        update public.matches
        set
          away_team_id = team_to_advance,
          updated_at = now()
        where id = target_preview.match_id;
      end if;

      target_match_id := target_preview.match_id;
    elsif target_preview.home_team_id is not null
      and target_preview.away_team_id is not null then

      generated_match_number := case
        when target_preview.round_key = 'round_of_16' then 88 + target_preview.match_order
        when target_preview.round_key = 'quarter_final' then 96 + target_preview.match_order
        when target_preview.round_key = 'semi_final' then 100 + target_preview.match_order
        when target_preview.round_key = 'third_place' then 103
        when target_preview.round_key = 'final' then 104
        else null
      end;

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
        target_preview.home_team_id,
        target_preview.away_team_id,
        target_preview.kickoff_time,
        target_preview.round_key::match_stage,
        null,
        null,
        null,
        null,
        'scheduled'::match_status,
        generated_match_number,
        target_preview.venue_city,
        target_preview.venue_label,
        target_preview.match_code,
        target_preview.round_label
      )
      returning id into target_match_id;

      update public.knockout_matches_preview
      set
        match_id = target_match_id,
        is_confirmed = true,
        confirmed_at = now(),
        confirmed_by = auth.uid(),
        prediction_status = 'open',
        updated_at = now()
      where id = target_preview.id;
    else
      target_match_id := null;
    end if;

    target_match_code := link_record.target_match_code;
    target_slot := link_record.target_slot;
    advanced_team_id := team_to_advance;
    created_match_id := target_match_id;

    return next;
  end loop;
end;
$function$;
GRANT ALL ON FUNCTION public.advance_knockout_result(uuid) TO anon;
GRANT ALL ON FUNCTION public.advance_knockout_result(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.advance_knockout_result(uuid) TO service_role;
CREATE FUNCTION public.confirm_round_of_32_bracket_test_mode(third_place_selections jsonb)
 RETURNS TABLE(confirmed_match_code text, created_match_id uuid)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;
GRANT ALL ON FUNCTION public.confirm_round_of_32_bracket_test_mode(jsonb) TO anon;
GRANT ALL ON FUNCTION public.confirm_round_of_32_bracket_test_mode(jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.confirm_round_of_32_bracket_test_mode(jsonb) TO service_role;
CREATE FUNCTION public.resolve_round_of_32_slot_for_test(p_match_code text, p_slot_side text, p_slot_label text, p_selections jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;
GRANT ALL ON FUNCTION public.resolve_round_of_32_slot_for_test(text, text, text, jsonb) TO anon;
GRANT ALL ON FUNCTION public.resolve_round_of_32_slot_for_test(text, text, text, jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.resolve_round_of_32_slot_for_test(text, text, text, jsonb) TO service_role;
CREATE VIEW public.knockout_bracket_view AS SELECT kmp.id,
    kmp.match_code,
    kmp.round_key,
    kmp.round_label,
    kmp.round_order,
    kmp.match_order,
    kmp.kickoff_time,
    kmp.venue_city,
    kmp.venue_label,
    kmp.home_slot_label,
    kmp.away_slot_label,
    kmp.prediction_status,
    kmp.home_team_id,
    kmp.away_team_id,
    kmp.match_id,
    kmp.is_confirmed,
    kmp.confirmed_at,
    kmp.confirmed_by,
    kmp.created_at,
    kmp.updated_at,
    ht.code AS home_team_code,
    ht.name_pl AS home_team_name_pl,
    ht.name_en AS home_team_name_en,
    ht.flag_code AS home_team_flag_code,
    ht.flag_emoji AS home_team_flag_emoji,
    at.code AS away_team_code,
    at.name_pl AS away_team_name_pl,
    at.name_en AS away_team_name_en,
    at.flag_code AS away_team_flag_code,
    at.flag_emoji AS away_team_flag_emoji,
    m.match_number,
    m.status,
    m.home_score,
    m.away_score,
    m.winner_team_id,
    m.resolution_method,
    m.home_penalty_score,
    m.away_penalty_score,
    wt.code AS winner_team_code,
    wt.name_pl AS winner_team_name_pl,
    wt.name_en AS winner_team_name_en,
    wt.flag_code AS winner_team_flag_code,
    wt.flag_emoji AS winner_team_flag_emoji
   FROM ((((public.knockout_matches_preview kmp
     LEFT JOIN public.teams ht ON ((ht.id = kmp.home_team_id)))
     LEFT JOIN public.teams at ON ((at.id = kmp.away_team_id)))
     LEFT JOIN public.matches m ON ((m.id = kmp.match_id)))
     LEFT JOIN public.teams wt ON ((wt.id = m.winner_team_id)));
GRANT ALL ON public.knockout_bracket_view TO anon;
GRANT ALL ON public.knockout_bracket_view TO authenticated;
GRANT ALL ON public.knockout_bracket_view TO service_role;

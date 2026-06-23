create or replace function public.advance_knockout_result(p_match_id uuid)
returns table (
  target_match_code text,
  target_slot text,
  advanced_team_id uuid,
  created_match_id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
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
$$;
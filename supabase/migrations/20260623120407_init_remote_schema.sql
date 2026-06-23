


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."match_stage" AS ENUM (
    'group_stage',
    'round_of_32',
    'round_of_16',
    'quarter_final',
    'semi_final',
    'third_place',
    'final',
    'knockout_stage'
);


ALTER TYPE "public"."match_stage" OWNER TO "postgres";


CREATE TYPE "public"."match_status" AS ENUM (
    'scheduled',
    'live',
    'finished'
);


ALTER TYPE "public"."match_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."confirm_round_of_32_bracket"("third_place_selections" "jsonb" DEFAULT '[]'::"jsonb") RETURNS TABLE("match_code" "text", "match_id" "uuid", "match_number" integer, "home_team_id" "uuid", "away_team_id" "uuid", "message" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  validation_errors_count integer;
begin
  if not is_admin() then
    raise exception 'Only admins can confirm knockout bracket.';
  end if;

  if third_place_selections is null then
    third_place_selections := '[]'::jsonb;
  end if;

  if jsonb_typeof(third_place_selections) <> 'array' then
    raise exception 'Payload must be a JSON array.';
  end if;

  select count(*)
  into validation_errors_count
  from public.validate_round_of_32_confirmation(third_place_selections)
  where severity = 'error';

  if validation_errors_count > 0 then
    raise exception 'Round of 32 bracket validation failed. Errors count: %', validation_errors_count;
  end if;

  lock table public.matches in share row exclusive mode;
  lock table public.knockout_matches_preview in share row exclusive mode;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  valid_options as (
    select
      match_code,
      slot_side,
      team_id
    from public.knockout_round_of_32_third_place_options_view
  ),
  valid_input as (
    select
      ir.match_code,
      ir.slot_side,
      ir.team_id
    from input_rows ir
    join valid_options vo
      on vo.match_code = ir.match_code
      and vo.slot_side = ir.slot_side
      and vo.team_id = ir.team_id
  ),
  proposal as (
    select *
    from public.knockout_round_of_32_proposal_view
  ),
  resolved_matches as (
    select
      p.id as preview_id,
      p.match_code,
      p.round_key,
      p.round_label,
      p.match_order,
      p.kickoff_time,
      p.venue_city,
      p.venue_label,

      case
        when p.home_slot_type = 'auto_top_two' then p.home_auto_team_id
        when p.home_slot_type = 'third_place_dropdown' then hvi.team_id
        else null
      end as home_team_id,

      case
        when p.away_slot_type = 'auto_top_two' then p.away_auto_team_id
        when p.away_slot_type = 'third_place_dropdown' then avi.team_id
        else null
      end as away_team_id

    from proposal p
    left join valid_input hvi
      on hvi.match_code = p.match_code
      and hvi.slot_side = 'home'
    left join valid_input avi
      on avi.match_code = p.match_code
      and avi.slot_side = 'away'
  ),
  inserted_matches as (
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
    select
      rm.home_team_id,
      rm.away_team_id,
      rm.kickoff_time,
      rm.round_key::match_stage,
      null,
      null,
      null,
      null,
      'scheduled'::match_status,
      72 + rm.match_order,
      rm.venue_city,
      rm.venue_label,
      rm.match_code,
      rm.round_label
    from resolved_matches rm
    order by rm.match_order
    returning
      public.matches.id,
      public.matches.match_code,
      public.matches.match_number,
      public.matches.home_team_id,
      public.matches.away_team_id
  ),
  updated_preview as (
    update public.knockout_matches_preview kmp
    set
      home_team_id = im.home_team_id,
      away_team_id = im.away_team_id,
      match_id = im.id,
      is_confirmed = true,
      confirmed_at = now(),
      confirmed_by = auth.uid(),
      prediction_status = 'open',
      updated_at = now()
    from inserted_matches im
    where kmp.match_code = im.match_code
    returning
      kmp.match_code,
      kmp.match_id,
      im.match_number,
      kmp.home_team_id,
      kmp.away_team_id
  )
  select
    up.match_code,
    up.match_id,
    up.match_number,
    up.home_team_id,
    up.away_team_id,
    'Round of 32 match confirmed and created.'::text as message
  from updated_preview up
  order by up.match_number;
end;
$$;


ALTER FUNCTION "public"."confirm_round_of_32_bracket"("third_place_selections" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  profile_username text;
begin
  profile_username := lower(new.raw_user_meta_data ->> 'username');

  if profile_username is null or profile_username = '' then
    profile_username := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, profile_username, 'user');

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_match_started"("match_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.matches
    where id = match_id
      and kickoff_time <= now()
  );
$$;


ALTER FUNCTION "public"."is_match_started"("match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_tournament_started"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select now() >= (
    select tournament_predictions_deadline
    from public.tournament_settings
    where id = 1
  );
$$;


ALTER FUNCTION "public"."is_tournament_started"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_username_available"("input_username" "text") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select not exists (
    select 1
    from public.profiles
    where username = lower(input_username)
  );
$$;


ALTER FUNCTION "public"."is_username_available"("input_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_round_of_32_confirmation"("third_place_selections" "jsonb" DEFAULT '[]'::"jsonb") RETURNS TABLE("severity" "text", "check_key" "text", "match_code" "text", "slot_side" "text", "slot_label" "text", "team_id" "uuid", "team_code" "text", "team_name_pl" "text", "message" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  if not is_admin() then
    raise exception 'Only admins can validate knockout bracket confirmation.';
  end if;

  if third_place_selections is null then
    third_place_selections := '[]'::jsonb;
  end if;

  if jsonb_typeof(third_place_selections) <> 'array' then
    return query
    select
      'error'::text,
      'invalid_payload'::text,
      null::text,
      null::text,
      null::text,
      null::uuid,
      null::text,
      null::text,
      'Payload must be a JSON array.'::text;

    return;
  end if;

  return query
  with readiness as (
    select *
    from public.knockout_admin_readiness_view
  )
  select
    case
      when can_confirm_round_of_32 then 'info'
      else 'error'
    end::text as severity,
    'readiness'::text as check_key,
    null::text as match_code,
    null::text as slot_side,
    null::text as slot_label,
    null::uuid as team_id,
    null::text as team_code,
    null::text as team_name_pl,
    case
      when can_confirm_round_of_32
        then 'Round of 32 bracket can be confirmed.'
      when readiness_status = 'group_stage_in_progress'
        then 'Group stage is still in progress. Unfinished matches: ' || unfinished_group_matches::text
      when readiness_status = 'round_of_32_already_confirmed'
        then 'Round of 32 is already confirmed.'
      when readiness_status = 'knockout_matches_already_created'
        then 'Knockout matches already exist in matches table.'
      else 'Bracket is not ready. Status: ' || readiness_status
    end::text as message
  from readiness;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  required_slots as (
    select distinct
      match_code,
      slot_side,
      slot_label
    from public.knockout_round_of_32_third_place_options_view
  ),
  missing_slots as (
    select
      rs.match_code,
      rs.slot_side,
      rs.slot_label
    from required_slots rs
    left join input_rows ir
      on ir.match_code = rs.match_code
      and ir.slot_side = rs.slot_side
    where ir.team_id is null
  )
  select
    'error'::text,
    'missing_third_place_selection'::text,
    ms.match_code,
    ms.slot_side,
    ms.slot_label,
    null::uuid,
    null::text,
    null::text,
    'Missing third-place team selection for this slot.'::text
  from missing_slots ms;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  duplicate_input as (
    select
      match_code,
      slot_side,
      count(*) as duplicates_count
    from input_rows
    group by match_code, slot_side
    having count(*) > 1
  )
  select
    'error'::text,
    'duplicate_input_selection'::text,
    di.match_code,
    di.slot_side,
    null::text,
    null::uuid,
    null::text,
    null::text,
    'Duplicate selection for the same match and slot.'::text
  from duplicate_input di;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  valid_options as (
    select
      match_code,
      slot_side,
      slot_label,
      team_id,
      code,
      name_pl
    from public.knockout_round_of_32_third_place_options_view
  ),
  invalid_options as (
    select
      ir.match_code,
      ir.slot_side,
      ir.team_id
    from input_rows ir
    left join valid_options vo
      on vo.match_code = ir.match_code
      and vo.slot_side = ir.slot_side
      and vo.team_id = ir.team_id
    where vo.team_id is null
  )
  select
    'error'::text,
    'invalid_third_place_option'::text,
    io.match_code,
    io.slot_side,
    null::text,
    io.team_id,
    t.code,
    t.name_pl,
    'Selected team is not a valid qualified third-place option for this slot.'::text
  from invalid_options io
  left join public.teams t
    on t.id = io.team_id;

  return query
  with proposal as (
    select *
    from public.knockout_round_of_32_proposal_view
  ),
  unresolved_auto as (
    select
      match_code,
      'home'::text as slot_side,
      home_slot_label as slot_label
    from proposal
    where home_slot_type = 'auto_top_two'
      and home_auto_team_id is null

    union all

    select
      match_code,
      'away'::text as slot_side,
      away_slot_label as slot_label
    from proposal
    where away_slot_type = 'auto_top_two'
      and away_auto_team_id is null
  )
  select
    'error'::text,
    'unresolved_auto_slot'::text,
    ua.match_code,
    ua.slot_side,
    ua.slot_label,
    null::uuid,
    null::text,
    null::text,
    'Automatic slot could not be resolved from group qualification view.'::text
  from unresolved_auto ua;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  valid_options as (
    select
      match_code,
      slot_side,
      team_id
    from public.knockout_round_of_32_third_place_options_view
  ),
  valid_input as (
    select
      ir.match_code,
      ir.slot_side,
      ir.team_id
    from input_rows ir
    join valid_options vo
      on vo.match_code = ir.match_code
      and vo.slot_side = ir.slot_side
      and vo.team_id = ir.team_id
  ),
  proposal as (
    select *
    from public.knockout_round_of_32_proposal_view
  ),
  resolved_slots as (
    select
      p.match_code,
      'home'::text as slot_side,
      p.home_slot_label as slot_label,
      case
        when p.home_slot_type = 'auto_top_two' then p.home_auto_team_id
        when p.home_slot_type = 'third_place_dropdown' then vi.team_id
        else null
      end as team_id
    from proposal p
    left join valid_input vi
      on vi.match_code = p.match_code
      and vi.slot_side = 'home'

    union all

    select
      p.match_code,
      'away'::text as slot_side,
      p.away_slot_label as slot_label,
      case
        when p.away_slot_type = 'auto_top_two' then p.away_auto_team_id
        when p.away_slot_type = 'third_place_dropdown' then vi.team_id
        else null
      end as team_id
    from proposal p
    left join valid_input vi
      on vi.match_code = p.match_code
      and vi.slot_side = 'away'
  ),
  duplicate_teams as (
    select
      team_id,
      count(*) as appearances_count
    from resolved_slots
    where team_id is not null
    group by team_id
    having count(*) > 1
  )
  select
    'error'::text,
    'duplicate_team_in_bracket'::text,
    null::text,
    null::text,
    null::text,
    dt.team_id,
    t.code,
    t.name_pl,
    'Team appears more than once in the proposed Round of 32 bracket.'::text
  from duplicate_teams dt
  join public.teams t
    on t.id = dt.team_id;

  return query
  with input_rows as (
    select
      upper(trim(x.match_code)) as match_code,
      lower(trim(x.slot_side)) as slot_side,
      x.team_id::uuid as team_id
    from jsonb_to_recordset(third_place_selections) as x(
      match_code text,
      slot_side text,
      team_id uuid
    )
  ),
  valid_options as (
    select
      match_code,
      slot_side,
      team_id
    from public.knockout_round_of_32_third_place_options_view
  ),
  valid_input as (
    select
      ir.match_code,
      ir.slot_side,
      ir.team_id
    from input_rows ir
    join valid_options vo
      on vo.match_code = ir.match_code
      and vo.slot_side = ir.slot_side
      and vo.team_id = ir.team_id
  ),
  proposal as (
    select *
    from public.knockout_round_of_32_proposal_view
  ),
  resolved_matches as (
    select
      p.match_code,
      p.home_slot_label,
      p.away_slot_label,
      case
        when p.home_slot_type = 'auto_top_two' then p.home_auto_team_id
        when p.home_slot_type = 'third_place_dropdown' then hvi.team_id
        else null
      end as home_team_id,
      case
        when p.away_slot_type = 'auto_top_two' then p.away_auto_team_id
        when p.away_slot_type = 'third_place_dropdown' then avi.team_id
        else null
      end as away_team_id
    from proposal p
    left join valid_input hvi
      on hvi.match_code = p.match_code
      and hvi.slot_side = 'home'
    left join valid_input avi
      on avi.match_code = p.match_code
      and avi.slot_side = 'away'
  )
  select
    'info'::text,
    'resolved_match'::text,
    rm.match_code,
    null::text,
    rm.home_slot_label || ' vs ' || rm.away_slot_label,
    null::uuid,
    null::text,
    null::text,
    coalesce(ht.flag_emoji || ' ', '') || coalesce(ht.name_pl, '???')
      || ' vs '
      || coalesce(at.flag_emoji || ' ', '') || coalesce(at.name_pl, '???') as message
  from resolved_matches rm
  left join public.teams ht
    on ht.id = rm.home_team_id
  left join public.teams at
    on at.id = rm.away_team_id
  order by rm.match_code;
end;
$$;


ALTER FUNCTION "public"."validate_round_of_32_confirmation"("third_place_selections" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "home_team_id" "uuid" NOT NULL,
    "away_team_id" "uuid" NOT NULL,
    "kickoff_time" timestamp with time zone NOT NULL,
    "stage" "public"."match_stage" DEFAULT 'group_stage'::"public"."match_stage" NOT NULL,
    "group_name" "text",
    "matchday" integer,
    "home_score" integer,
    "away_score" integer,
    "status" "public"."match_status" DEFAULT 'scheduled'::"public"."match_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "match_number" integer,
    "venue_city_en" "text",
    "venue_city_pl" "text",
    "match_code" "text",
    "round_key" "text",
    "round_label" "text",
    "winner_team_id" "uuid",
    "resolution_method" "text",
    "home_penalty_score" integer,
    "away_penalty_score" integer,
    CONSTRAINT "matches_away_penalty_score_non_negative" CHECK ((("away_penalty_score" IS NULL) OR ("away_penalty_score" >= 0))),
    CONSTRAINT "matches_away_score_non_negative" CHECK ((("away_score" IS NULL) OR ("away_score" >= 0))),
    CONSTRAINT "matches_different_teams" CHECK (("home_team_id" <> "away_team_id")),
    CONSTRAINT "matches_finished_requires_score" CHECK ((("status" <> 'finished'::"public"."match_status") OR (("home_score" IS NOT NULL) AND ("away_score" IS NOT NULL)))),
    CONSTRAINT "matches_group_name_format" CHECK ((("group_name" IS NULL) OR ("group_name" ~ '^Group [A-L]$'::"text"))),
    CONSTRAINT "matches_home_penalty_score_non_negative" CHECK ((("home_penalty_score" IS NULL) OR ("home_penalty_score" >= 0))),
    CONSTRAINT "matches_home_score_non_negative" CHECK ((("home_score" IS NULL) OR ("home_score" >= 0))),
    CONSTRAINT "matches_knockout_result_consistency" CHECK (((("stage" = 'group_stage'::"public"."match_stage") AND ("winner_team_id" IS NULL) AND ("resolution_method" IS NULL) AND ("home_penalty_score" IS NULL) AND ("away_penalty_score" IS NULL)) OR (("stage" = ANY (ARRAY['round_of_32'::"public"."match_stage", 'round_of_16'::"public"."match_stage", 'quarter_final'::"public"."match_stage", 'semi_final'::"public"."match_stage", 'third_place'::"public"."match_stage", 'final'::"public"."match_stage"])) AND ("status" <> 'finished'::"public"."match_status") AND ("winner_team_id" IS NULL) AND ("resolution_method" IS NULL) AND ("home_penalty_score" IS NULL) AND ("away_penalty_score" IS NULL)) OR (("stage" = ANY (ARRAY['round_of_32'::"public"."match_stage", 'round_of_16'::"public"."match_stage", 'quarter_final'::"public"."match_stage", 'semi_final'::"public"."match_stage", 'third_place'::"public"."match_stage", 'final'::"public"."match_stage"])) AND ("status" = 'finished'::"public"."match_status") AND ("home_score" IS NOT NULL) AND ("away_score" IS NOT NULL) AND (("winner_team_id" = "home_team_id") OR ("winner_team_id" = "away_team_id")) AND ("resolution_method" IS NOT NULL) AND ((("resolution_method" = 'in_match'::"text") AND ("home_score" <> "away_score") AND ("home_penalty_score" IS NULL) AND ("away_penalty_score" IS NULL) AND ((("home_score" > "away_score") AND ("winner_team_id" = "home_team_id")) OR (("away_score" > "home_score") AND ("winner_team_id" = "away_team_id")))) OR (("resolution_method" = 'penalties'::"text") AND ("home_score" = "away_score") AND ("home_penalty_score" IS NOT NULL) AND ("away_penalty_score" IS NOT NULL) AND ("home_penalty_score" <> "away_penalty_score") AND ((("home_penalty_score" > "away_penalty_score") AND ("winner_team_id" = "home_team_id")) OR (("away_penalty_score" > "home_penalty_score") AND ("winner_team_id" = "away_team_id")))))))),
    CONSTRAINT "matches_match_number_positive" CHECK ((("match_number" IS NULL) OR ("match_number" > 0))),
    CONSTRAINT "matches_matchday_range" CHECK ((("matchday" IS NULL) OR (("matchday" >= 1) AND ("matchday" <= 3)))),
    CONSTRAINT "matches_resolution_method_allowed" CHECK ((("resolution_method" IS NULL) OR ("resolution_method" = ANY (ARRAY['in_match'::"text", 'penalties'::"text"])))),
    CONSTRAINT "matches_unfinished_without_score" CHECK ((("status" = 'finished'::"public"."match_status") OR (("home_score" IS NULL) AND ("away_score" IS NULL)))),
    CONSTRAINT "matches_venue_city_en_length" CHECK ((("venue_city_en" IS NULL) OR (("char_length"("venue_city_en") >= 2) AND ("char_length"("venue_city_en") <= 80)))),
    CONSTRAINT "matches_venue_city_pl_length" CHECK ((("venue_city_pl" IS NULL) OR (("char_length"("venue_city_pl") >= 2) AND ("char_length"("venue_city_pl") <= 80))))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


COMMENT ON COLUMN "public"."matches"."round_key" IS 'Deprecated/unused. Knockout round is represented by matches.stage. matches_view exposes round_key computed from stage.';



COMMENT ON COLUMN "public"."matches"."winner_team_id" IS 'For knockout matches: team that advanced/won the match. Null for group-stage matches and unfinished knockout matches.';



COMMENT ON COLUMN "public"."matches"."resolution_method" IS 'For knockout matches: in_match or penalties. in_match means no penalty shootout.';



COMMENT ON COLUMN "public"."matches"."home_penalty_score" IS 'Penalty shootout score for home team, admin-only result metadata. Null unless resolution_method = penalties.';



COMMENT ON COLUMN "public"."matches"."away_penalty_score" IS 'Penalty shootout score for away team, admin-only result metadata. Null unless resolution_method = penalties.';



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name_en" "text" NOT NULL,
    "code" "text" NOT NULL,
    "group_name" "text",
    "flag_emoji" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name_pl" "text",
    "flag_code" "text",
    CONSTRAINT "teams_code_format" CHECK (("code" ~ '^[A-Z]{3}$'::"text")),
    CONSTRAINT "teams_flag_code_format" CHECK ((("flag_code" IS NULL) OR ("flag_code" ~ '^[a-z]{2}$'::"text"))),
    CONSTRAINT "teams_group_name_format" CHECK ((("group_name" IS NULL) OR ("group_name" ~ '^Group [A-L]$'::"text"))),
    CONSTRAINT "teams_name_length" CHECK ((("char_length"("name_en") >= 2) AND ("char_length"("name_en") <= 80))),
    CONSTRAINT "teams_name_pl_length" CHECK ((("name_pl" IS NULL) OR (("char_length"("name_pl") >= 2) AND ("char_length"("name_pl") <= 80))))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."matches_view" AS
 SELECT "m"."id",
    "m"."match_number",
    "m"."kickoff_time",
    "m"."stage",
    "m"."group_name",
    "m"."matchday",
    "m"."venue_city_en",
    "m"."venue_city_pl",
    "m"."home_score",
    "m"."away_score",
    "m"."status",
    "ht"."id" AS "home_team_id",
    "ht"."code" AS "home_team_code",
    "ht"."name_en" AS "home_team_name_en",
    "ht"."name_pl" AS "home_team_name_pl",
    "ht"."flag_code" AS "home_team_flag_code",
    "ht"."flag_emoji" AS "home_team_flag_emoji",
    "at"."id" AS "away_team_id",
    "at"."code" AS "away_team_code",
    "at"."name_en" AS "away_team_name_en",
    "at"."name_pl" AS "away_team_name_pl",
    "at"."flag_code" AS "away_team_flag_code",
    "at"."flag_emoji" AS "away_team_flag_emoji",
    "m"."match_code",
        CASE
            WHEN ("m"."stage" = 'group_stage'::"public"."match_stage") THEN NULL::"text"
            ELSE ("m"."stage")::"text"
        END AS "round_key",
    "m"."round_label",
    "m"."winner_team_id",
    "wt"."code" AS "winner_team_code",
    "wt"."name_en" AS "winner_team_name_en",
    "wt"."name_pl" AS "winner_team_name_pl",
    "wt"."flag_code" AS "winner_team_flag_code",
    "wt"."flag_emoji" AS "winner_team_flag_emoji",
    "m"."resolution_method",
    "m"."home_penalty_score",
    "m"."away_penalty_score"
   FROM ((("public"."matches" "m"
     JOIN "public"."teams" "ht" ON (("ht"."id" = "m"."home_team_id")))
     JOIN "public"."teams" "at" ON (("at"."id" = "m"."away_team_id")))
     LEFT JOIN "public"."teams" "wt" ON (("wt"."id" = "m"."winner_team_id")));


ALTER VIEW "public"."matches_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "match_id" "uuid" NOT NULL,
    "predicted_home_score" integer NOT NULL,
    "predicted_away_score" integer NOT NULL,
    "points" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "predicted_winner_team_id" "uuid",
    "predicted_resolution_method" "text",
    CONSTRAINT "predictions_away_score_non_negative" CHECK (("predicted_away_score" >= 0)),
    CONSTRAINT "predictions_home_score_non_negative" CHECK (("predicted_home_score" >= 0)),
    CONSTRAINT "predictions_knockout_fields_pair" CHECK (((("predicted_winner_team_id" IS NULL) AND ("predicted_resolution_method" IS NULL)) OR (("predicted_winner_team_id" IS NOT NULL) AND ("predicted_resolution_method" IS NOT NULL)))),
    CONSTRAINT "predictions_knockout_score_consistency" CHECK ((("predicted_resolution_method" IS NULL) OR (("predicted_resolution_method" = 'in_match'::"text") AND ("predicted_home_score" <> "predicted_away_score")) OR (("predicted_resolution_method" = 'penalties'::"text") AND ("predicted_home_score" = "predicted_away_score")))),
    CONSTRAINT "predictions_points_allowed" CHECK ((("points" IS NULL) OR ("points" = ANY (ARRAY[0, 1, 2, 3, 4])))),
    CONSTRAINT "predictions_resolution_method_allowed" CHECK ((("predicted_resolution_method" IS NULL) OR ("predicted_resolution_method" = ANY (ARRAY['in_match'::"text", 'penalties'::"text"]))))
);


ALTER TABLE "public"."predictions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."predictions"."predicted_winner_team_id" IS 'For knockout predictions: user-selected advancing team. Null for group-stage predictions.';



COMMENT ON COLUMN "public"."predictions"."predicted_resolution_method" IS 'For knockout predictions: in_match or penalties. Null for group-stage predictions.';



CREATE OR REPLACE VIEW "public"."admin_matches_overview_view" AS
 SELECT "mv"."id",
    "mv"."match_number",
    "mv"."kickoff_time",
    "mv"."stage",
    "mv"."group_name",
    "mv"."matchday",
    "mv"."venue_city_en",
    "mv"."venue_city_pl",
    "mv"."home_score",
    "mv"."away_score",
    "mv"."status",
    "mv"."home_team_id",
    "mv"."home_team_code",
    "mv"."home_team_name_en",
    "mv"."home_team_name_pl",
    "mv"."home_team_flag_code",
    "mv"."home_team_flag_emoji",
    "mv"."away_team_id",
    "mv"."away_team_code",
    "mv"."away_team_name_en",
    "mv"."away_team_name_pl",
    "mv"."away_team_flag_code",
    "mv"."away_team_flag_emoji",
    ("count"("p"."id"))::integer AS "predictions_count",
    "mv"."match_code",
    "mv"."round_key",
    "mv"."round_label",
    "mv"."winner_team_id",
    "mv"."winner_team_code",
    "mv"."winner_team_name_en",
    "mv"."winner_team_name_pl",
    "mv"."winner_team_flag_code",
    "mv"."winner_team_flag_emoji",
    "mv"."resolution_method",
    "mv"."home_penalty_score",
    "mv"."away_penalty_score"
   FROM ("public"."matches_view" "mv"
     LEFT JOIN "public"."predictions" "p" ON (("p"."match_id" = "mv"."id")))
  GROUP BY "mv"."id", "mv"."match_number", "mv"."kickoff_time", "mv"."stage", "mv"."group_name", "mv"."matchday", "mv"."venue_city_en", "mv"."venue_city_pl", "mv"."home_score", "mv"."away_score", "mv"."status", "mv"."home_team_id", "mv"."home_team_code", "mv"."home_team_name_en", "mv"."home_team_name_pl", "mv"."home_team_flag_code", "mv"."home_team_flag_emoji", "mv"."away_team_id", "mv"."away_team_code", "mv"."away_team_name_en", "mv"."away_team_name_pl", "mv"."away_team_flag_code", "mv"."away_team_flag_emoji", "mv"."match_code", "mv"."round_key", "mv"."round_label", "mv"."winner_team_id", "mv"."winner_team_code", "mv"."winner_team_name_en", "mv"."winner_team_name_pl", "mv"."winner_team_flag_code", "mv"."winner_team_flag_emoji", "mv"."resolution_method", "mv"."home_penalty_score", "mv"."away_penalty_score";


ALTER VIEW "public"."admin_matches_overview_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."group_qualification_view" WITH ("security_invoker"='true') AS
 WITH "team_match_rows" AS (
         SELECT "m"."home_team_id" AS "team_id",
            "m"."group_name",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL)) THEN 1
                    ELSE 0
                END AS "played",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."home_score" > "m"."away_score")) THEN 1
                    ELSE 0
                END AS "wins",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."home_score" = "m"."away_score")) THEN 1
                    ELSE 0
                END AS "draws",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."home_score" < "m"."away_score")) THEN 1
                    ELSE 0
                END AS "losses",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL)) THEN "m"."home_score"
                    ELSE 0
                END AS "goals_for",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."away_score" IS NOT NULL)) THEN "m"."away_score"
                    ELSE 0
                END AS "goals_against",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."home_score" > "m"."away_score")) THEN 3
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."home_score" = "m"."away_score")) THEN 1
                    ELSE 0
                END AS "points"
           FROM "public"."matches" "m"
          WHERE ("m"."stage" = 'group_stage'::"public"."match_stage")
        UNION ALL
         SELECT "m"."away_team_id" AS "team_id",
            "m"."group_name",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL)) THEN 1
                    ELSE 0
                END AS "played",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."away_score" > "m"."home_score")) THEN 1
                    ELSE 0
                END AS "wins",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."away_score" = "m"."home_score")) THEN 1
                    ELSE 0
                END AS "draws",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."away_score" < "m"."home_score")) THEN 1
                    ELSE 0
                END AS "losses",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."away_score" IS NOT NULL)) THEN "m"."away_score"
                    ELSE 0
                END AS "goals_for",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL)) THEN "m"."home_score"
                    ELSE 0
                END AS "goals_against",
                CASE
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."away_score" > "m"."home_score")) THEN 3
                    WHEN (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL) AND ("m"."away_score" = "m"."home_score")) THEN 1
                    ELSE 0
                END AS "points"
           FROM "public"."matches" "m"
          WHERE ("m"."stage" = 'group_stage'::"public"."match_stage")
        ), "team_stats" AS (
         SELECT "t"."id" AS "team_id",
            "t"."group_name",
            "t"."code",
            "t"."name_pl",
            "t"."name_en",
            "t"."flag_code",
            "t"."flag_emoji",
            (COALESCE("sum"("tmr"."played"), (0)::bigint))::integer AS "played",
            (COALESCE("sum"("tmr"."wins"), (0)::bigint))::integer AS "wins",
            (COALESCE("sum"("tmr"."draws"), (0)::bigint))::integer AS "draws",
            (COALESCE("sum"("tmr"."losses"), (0)::bigint))::integer AS "losses",
            (COALESCE("sum"("tmr"."goals_for"), (0)::bigint))::integer AS "goals_for",
            (COALESCE("sum"("tmr"."goals_against"), (0)::bigint))::integer AS "goals_against",
            ((COALESCE("sum"("tmr"."goals_for"), (0)::bigint) - COALESCE("sum"("tmr"."goals_against"), (0)::bigint)))::integer AS "goal_difference",
            (COALESCE("sum"("tmr"."points"), (0)::bigint))::integer AS "points"
           FROM ("public"."teams" "t"
             LEFT JOIN "team_match_rows" "tmr" ON (("tmr"."team_id" = "t"."id")))
          GROUP BY "t"."id", "t"."group_name", "t"."code", "t"."name_pl", "t"."name_en", "t"."flag_code", "t"."flag_emoji"
        ), "group_ranked" AS (
         SELECT "ts"."team_id",
            "ts"."group_name",
            "ts"."code",
            "ts"."name_pl",
            "ts"."name_en",
            "ts"."flag_code",
            "ts"."flag_emoji",
            "ts"."played",
            "ts"."wins",
            "ts"."draws",
            "ts"."losses",
            "ts"."goals_for",
            "ts"."goals_against",
            "ts"."goal_difference",
            "ts"."points",
            ("row_number"() OVER (PARTITION BY "ts"."group_name" ORDER BY "ts"."points" DESC, "ts"."goal_difference" DESC, "ts"."goals_for" DESC, "ts"."name_pl"))::integer AS "group_position"
           FROM "team_stats" "ts"
        ), "third_place_ranked" AS (
         SELECT "gr_1"."team_id",
            ("row_number"() OVER (ORDER BY "gr_1"."points" DESC, "gr_1"."goal_difference" DESC, "gr_1"."goals_for" DESC, "gr_1"."name_pl"))::integer AS "third_place_rank"
           FROM "group_ranked" "gr_1"
          WHERE ("gr_1"."group_position" = 3)
        )
 SELECT "gr"."team_id",
    "gr"."group_name",
    "gr"."code",
    "gr"."name_pl",
    "gr"."name_en",
    "gr"."flag_code",
    "gr"."flag_emoji",
    "gr"."played",
    "gr"."wins",
    "gr"."draws",
    "gr"."losses",
    "gr"."goals_for",
    "gr"."goals_against",
    "gr"."goal_difference",
    "gr"."points",
    "gr"."group_position",
    "tpr"."third_place_rank",
        CASE
            WHEN ("gr"."group_position" <= 2) THEN 'qualified_top_two'::"text"
            WHEN (("gr"."group_position" = 3) AND ("tpr"."third_place_rank" <= 8)) THEN 'qualified_third_place'::"text"
            ELSE 'eliminated'::"text"
        END AS "qualification_status"
   FROM ("group_ranked" "gr"
     LEFT JOIN "third_place_ranked" "tpr" ON (("tpr"."team_id" = "gr"."team_id")));


ALTER VIEW "public"."group_qualification_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."group_standings_view" WITH ("security_invoker"='true') AS
 WITH "team_matches" AS (
         SELECT "ht"."id" AS "team_id",
            "ht"."code",
            "ht"."name_en",
            "ht"."name_pl",
            "ht"."flag_code",
            "ht"."flag_emoji",
            "m"."group_name",
            "m"."home_score" AS "goals_for",
            "m"."away_score" AS "goals_against",
                CASE
                    WHEN ("m"."home_score" > "m"."away_score") THEN 3
                    WHEN ("m"."home_score" = "m"."away_score") THEN 1
                    ELSE 0
                END AS "points",
                CASE
                    WHEN ("m"."home_score" > "m"."away_score") THEN 1
                    ELSE 0
                END AS "wins",
                CASE
                    WHEN ("m"."home_score" = "m"."away_score") THEN 1
                    ELSE 0
                END AS "draws",
                CASE
                    WHEN ("m"."home_score" < "m"."away_score") THEN 1
                    ELSE 0
                END AS "losses"
           FROM ("public"."matches" "m"
             JOIN "public"."teams" "ht" ON (("ht"."id" = "m"."home_team_id")))
          WHERE (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL))
        UNION ALL
         SELECT "at"."id" AS "team_id",
            "at"."code",
            "at"."name_en",
            "at"."name_pl",
            "at"."flag_code",
            "at"."flag_emoji",
            "m"."group_name",
            "m"."away_score" AS "goals_for",
            "m"."home_score" AS "goals_against",
                CASE
                    WHEN ("m"."away_score" > "m"."home_score") THEN 3
                    WHEN ("m"."away_score" = "m"."home_score") THEN 1
                    ELSE 0
                END AS "points",
                CASE
                    WHEN ("m"."away_score" > "m"."home_score") THEN 1
                    ELSE 0
                END AS "wins",
                CASE
                    WHEN ("m"."away_score" = "m"."home_score") THEN 1
                    ELSE 0
                END AS "draws",
                CASE
                    WHEN ("m"."away_score" < "m"."home_score") THEN 1
                    ELSE 0
                END AS "losses"
           FROM ("public"."matches" "m"
             JOIN "public"."teams" "at" ON (("at"."id" = "m"."away_team_id")))
          WHERE (("m"."status" = 'finished'::"public"."match_status") AND ("m"."home_score" IS NOT NULL) AND ("m"."away_score" IS NOT NULL))
        ), "all_group_teams" AS (
         SELECT "t"."id" AS "team_id",
            "t"."code",
            "t"."name_en",
            "t"."name_pl",
            "t"."flag_code",
            "t"."flag_emoji",
            "t"."group_name"
           FROM "public"."teams" "t"
        )
 SELECT "agt"."team_id",
    "agt"."code",
    "agt"."name_en",
    "agt"."name_pl",
    "agt"."flag_code",
    "agt"."flag_emoji",
    "agt"."group_name",
    (COALESCE("count"("tm"."team_id"), (0)::bigint))::integer AS "played",
    (COALESCE("sum"("tm"."wins"), (0)::bigint))::integer AS "wins",
    (COALESCE("sum"("tm"."draws"), (0)::bigint))::integer AS "draws",
    (COALESCE("sum"("tm"."losses"), (0)::bigint))::integer AS "losses",
    (COALESCE("sum"("tm"."goals_for"), (0)::bigint))::integer AS "goals_for",
    (COALESCE("sum"("tm"."goals_against"), (0)::bigint))::integer AS "goals_against",
    (COALESCE("sum"(("tm"."goals_for" - "tm"."goals_against")), (0)::bigint))::integer AS "goal_difference",
    (COALESCE("sum"("tm"."points"), (0)::bigint))::integer AS "points"
   FROM ("all_group_teams" "agt"
     LEFT JOIN "team_matches" "tm" ON (("tm"."team_id" = "agt"."team_id")))
  GROUP BY "agt"."team_id", "agt"."code", "agt"."name_en", "agt"."name_pl", "agt"."flag_code", "agt"."flag_emoji", "agt"."group_name";


ALTER VIEW "public"."group_standings_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knockout_matches_preview" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_code" "text" NOT NULL,
    "round_key" "text" NOT NULL,
    "round_label" "text" NOT NULL,
    "round_order" integer NOT NULL,
    "match_order" integer NOT NULL,
    "kickoff_time" timestamp with time zone,
    "venue_city" "text" NOT NULL,
    "venue_label" "text" NOT NULL,
    "home_slot_label" "text" NOT NULL,
    "away_slot_label" "text" NOT NULL,
    "prediction_status" "text" DEFAULT 'locked'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "home_team_id" "uuid",
    "away_team_id" "uuid",
    "match_id" "uuid",
    "is_confirmed" boolean DEFAULT false NOT NULL,
    "confirmed_at" timestamp with time zone,
    "confirmed_by" "uuid",
    CONSTRAINT "knockout_preview_different_teams" CHECK ((("home_team_id" IS NULL) OR ("away_team_id" IS NULL) OR ("home_team_id" <> "away_team_id"))),
    CONSTRAINT "knockout_preview_prediction_status_allowed" CHECK (("prediction_status" = ANY (ARRAY['locked'::"text", 'open'::"text"])))
);


ALTER TABLE "public"."knockout_matches_preview" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."knockout_round_of_32_proposal_view" AS
 WITH "round_of_32_matches" AS (
         SELECT "kmp"."id",
            "kmp"."match_code",
            "kmp"."round_key",
            "kmp"."round_label",
            "kmp"."round_order",
            "kmp"."match_order",
            "kmp"."kickoff_time",
            "kmp"."venue_city",
            "kmp"."venue_label",
            "kmp"."home_slot_label",
            "kmp"."away_slot_label",
            "kmp"."prediction_status",
            "kmp"."home_team_id" AS "confirmed_home_team_id",
            "kmp"."away_team_id" AS "confirmed_away_team_id",
            "kmp"."match_id",
            "kmp"."is_confirmed",
            "kmp"."confirmed_at",
            "kmp"."confirmed_by"
           FROM "public"."knockout_matches_preview" "kmp"
          WHERE ("kmp"."round_key" = 'round_of_32'::"text")
        ), "slot_analysis" AS (
         SELECT "r32"."id",
            "r32"."match_code",
            "r32"."round_key",
            "r32"."round_label",
            "r32"."round_order",
            "r32"."match_order",
            "r32"."kickoff_time",
            "r32"."venue_city",
            "r32"."venue_label",
            "r32"."home_slot_label",
            "r32"."away_slot_label",
            "r32"."prediction_status",
            "r32"."confirmed_home_team_id",
            "r32"."confirmed_away_team_id",
            "r32"."match_id",
            "r32"."is_confirmed",
            "r32"."confirmed_at",
            "r32"."confirmed_by",
                CASE
                    WHEN ("r32"."home_slot_label" ~ '^[A-L][12]$'::"text") THEN 'auto_top_two'::"text"
                    WHEN ("r32"."home_slot_label" ~ '^[A-L]3(/[A-L]3)+$'::"text") THEN 'third_place_dropdown'::"text"
                    ELSE 'placeholder'::"text"
                END AS "home_slot_type",
                CASE
                    WHEN ("r32"."away_slot_label" ~ '^[A-L][12]$'::"text") THEN 'auto_top_two'::"text"
                    WHEN ("r32"."away_slot_label" ~ '^[A-L]3(/[A-L]3)+$'::"text") THEN 'third_place_dropdown'::"text"
                    ELSE 'placeholder'::"text"
                END AS "away_slot_type",
                CASE
                    WHEN ("r32"."home_slot_label" ~ '^[A-L][12]$'::"text") THEN ('Group '::"text" || SUBSTRING("r32"."home_slot_label" FROM 1 FOR 1))
                    ELSE NULL::"text"
                END AS "home_auto_group_name",
                CASE
                    WHEN ("r32"."away_slot_label" ~ '^[A-L][12]$'::"text") THEN ('Group '::"text" || SUBSTRING("r32"."away_slot_label" FROM 1 FOR 1))
                    ELSE NULL::"text"
                END AS "away_auto_group_name",
                CASE
                    WHEN ("r32"."home_slot_label" ~ '^[A-L][12]$'::"text") THEN (SUBSTRING("r32"."home_slot_label" FROM 2 FOR 1))::integer
                    ELSE NULL::integer
                END AS "home_auto_group_position",
                CASE
                    WHEN ("r32"."away_slot_label" ~ '^[A-L][12]$'::"text") THEN (SUBSTRING("r32"."away_slot_label" FROM 2 FOR 1))::integer
                    ELSE NULL::integer
                END AS "away_auto_group_position"
           FROM "round_of_32_matches" "r32"
        )
 SELECT "sa"."id",
    "sa"."match_code",
    "sa"."round_key",
    "sa"."round_label",
    "sa"."round_order",
    "sa"."match_order",
    "sa"."kickoff_time",
    "sa"."venue_city",
    "sa"."venue_label",
    "sa"."home_slot_label",
    "sa"."away_slot_label",
    "sa"."prediction_status",
    "sa"."match_id",
    "sa"."is_confirmed",
    "sa"."confirmed_at",
    "sa"."confirmed_by",
    "sa"."home_slot_type",
    "sa"."home_auto_group_name",
    "sa"."home_auto_group_position",
    "hq"."team_id" AS "home_auto_team_id",
    "hq"."code" AS "home_auto_team_code",
    "hq"."name_pl" AS "home_auto_team_name_pl",
    "hq"."name_en" AS "home_auto_team_name_en",
    "hq"."flag_code" AS "home_auto_team_flag_code",
    "hq"."flag_emoji" AS "home_auto_team_flag_emoji",
    "hq"."points" AS "home_auto_team_points",
    "hq"."goal_difference" AS "home_auto_team_goal_difference",
    "sa"."away_slot_type",
    "sa"."away_auto_group_name",
    "sa"."away_auto_group_position",
    "aq"."team_id" AS "away_auto_team_id",
    "aq"."code" AS "away_auto_team_code",
    "aq"."name_pl" AS "away_auto_team_name_pl",
    "aq"."name_en" AS "away_auto_team_name_en",
    "aq"."flag_code" AS "away_auto_team_flag_code",
    "aq"."flag_emoji" AS "away_auto_team_flag_emoji",
    "aq"."points" AS "away_auto_team_points",
    "aq"."goal_difference" AS "away_auto_team_goal_difference",
    "sa"."confirmed_home_team_id",
    "cht"."code" AS "confirmed_home_team_code",
    "cht"."name_pl" AS "confirmed_home_team_name_pl",
    "cht"."name_en" AS "confirmed_home_team_name_en",
    "cht"."flag_code" AS "confirmed_home_team_flag_code",
    "cht"."flag_emoji" AS "confirmed_home_team_flag_emoji",
    "sa"."confirmed_away_team_id",
    "cat"."code" AS "confirmed_away_team_code",
    "cat"."name_pl" AS "confirmed_away_team_name_pl",
    "cat"."name_en" AS "confirmed_away_team_name_en",
    "cat"."flag_code" AS "confirmed_away_team_flag_code",
    "cat"."flag_emoji" AS "confirmed_away_team_flag_emoji"
   FROM (((("slot_analysis" "sa"
     LEFT JOIN "public"."group_qualification_view" "hq" ON ((("hq"."group_name" = "sa"."home_auto_group_name") AND ("hq"."group_position" = "sa"."home_auto_group_position"))))
     LEFT JOIN "public"."group_qualification_view" "aq" ON ((("aq"."group_name" = "sa"."away_auto_group_name") AND ("aq"."group_position" = "sa"."away_auto_group_position"))))
     LEFT JOIN "public"."teams" "cht" ON (("cht"."id" = "sa"."confirmed_home_team_id")))
     LEFT JOIN "public"."teams" "cat" ON (("cat"."id" = "sa"."confirmed_away_team_id")));


ALTER VIEW "public"."knockout_round_of_32_proposal_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."knockout_admin_readiness_view" AS
 WITH "group_matches" AS (
         SELECT ("count"(*))::integer AS "total_group_matches",
            ("count"(*) FILTER (WHERE ("matches"."status" = 'finished'::"public"."match_status")))::integer AS "finished_group_matches",
            ("count"(*) FILTER (WHERE ("matches"."status" <> 'finished'::"public"."match_status")))::integer AS "unfinished_group_matches"
           FROM "public"."matches"
          WHERE ("matches"."stage" = 'group_stage'::"public"."match_stage")
        ), "round_of_32_preview" AS (
         SELECT ("count"(*))::integer AS "total_round_of_32_matches",
            ("count"(*) FILTER (WHERE ("knockout_matches_preview"."is_confirmed" = true)))::integer AS "confirmed_round_of_32_matches",
            ("count"(*) FILTER (WHERE (("knockout_matches_preview"."home_team_id" IS NOT NULL) AND ("knockout_matches_preview"."away_team_id" IS NOT NULL))))::integer AS "round_of_32_matches_with_teams",
            ("count"(*) FILTER (WHERE ("knockout_matches_preview"."match_id" IS NOT NULL)))::integer AS "round_of_32_matches_with_match_id"
           FROM "public"."knockout_matches_preview"
          WHERE ("knockout_matches_preview"."round_key" = 'round_of_32'::"text")
        ), "knockout_matches" AS (
         SELECT ("count"(*))::integer AS "created_knockout_matches"
           FROM "public"."matches"
          WHERE ("matches"."stage" = ANY (ARRAY['round_of_32'::"public"."match_stage", 'round_of_16'::"public"."match_stage", 'quarter_final'::"public"."match_stage", 'semi_final'::"public"."match_stage", 'third_place'::"public"."match_stage", 'final'::"public"."match_stage"]))
        ), "proposal" AS (
         SELECT ("count"(*))::integer AS "proposal_matches_count",
            ("count"(*) FILTER (WHERE (("knockout_round_of_32_proposal_view"."home_slot_type" = 'auto_top_two'::"text") AND ("knockout_round_of_32_proposal_view"."home_auto_team_id" IS NOT NULL))))::integer AS "resolved_home_auto_slots",
            ("count"(*) FILTER (WHERE (("knockout_round_of_32_proposal_view"."away_slot_type" = 'auto_top_two'::"text") AND ("knockout_round_of_32_proposal_view"."away_auto_team_id" IS NOT NULL))))::integer AS "resolved_away_auto_slots",
            ("count"(*) FILTER (WHERE ("knockout_round_of_32_proposal_view"."away_slot_type" = 'third_place_dropdown'::"text")))::integer AS "third_place_dropdown_slots"
           FROM "public"."knockout_round_of_32_proposal_view"
        )
 SELECT "gm"."total_group_matches",
    "gm"."finished_group_matches",
    "gm"."unfinished_group_matches",
    ("gm"."unfinished_group_matches" = 0) AS "is_group_stage_finished",
    "r32"."total_round_of_32_matches",
    "r32"."confirmed_round_of_32_matches",
    "r32"."round_of_32_matches_with_teams",
    "r32"."round_of_32_matches_with_match_id",
    "km"."created_knockout_matches",
    "p"."proposal_matches_count",
    "p"."resolved_home_auto_slots",
    "p"."resolved_away_auto_slots",
    "p"."third_place_dropdown_slots",
    (("gm"."unfinished_group_matches" = 0) AND ("r32"."total_round_of_32_matches" = 16) AND ("r32"."confirmed_round_of_32_matches" = 0) AND ("km"."created_knockout_matches" = 0) AND ("p"."proposal_matches_count" = 16)) AS "can_confirm_round_of_32",
        CASE
            WHEN ("gm"."unfinished_group_matches" > 0) THEN 'group_stage_in_progress'::"text"
            WHEN ("r32"."total_round_of_32_matches" <> 16) THEN 'invalid_round_of_32_preview_count'::"text"
            WHEN ("r32"."confirmed_round_of_32_matches" > 0) THEN 'round_of_32_already_confirmed'::"text"
            WHEN ("km"."created_knockout_matches" > 0) THEN 'knockout_matches_already_created'::"text"
            WHEN ("p"."proposal_matches_count" <> 16) THEN 'invalid_proposal_count'::"text"
            ELSE 'ready'::"text"
        END AS "readiness_status"
   FROM ((("group_matches" "gm"
     CROSS JOIN "round_of_32_preview" "r32")
     CROSS JOIN "knockout_matches" "km")
     CROSS JOIN "proposal" "p");


ALTER VIEW "public"."knockout_admin_readiness_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knockout_match_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_match_code" "text" NOT NULL,
    "target_match_code" "text" NOT NULL,
    "target_slot" "text" NOT NULL,
    "source_result" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "knockout_match_links_no_self_link" CHECK (("source_match_code" <> "target_match_code")),
    CONSTRAINT "knockout_match_links_source_result_allowed" CHECK (("source_result" = ANY (ARRAY['winner'::"text", 'loser'::"text"]))),
    CONSTRAINT "knockout_match_links_target_slot_allowed" CHECK (("target_slot" = ANY (ARRAY['home'::"text", 'away'::"text"])))
);


ALTER TABLE "public"."knockout_match_links" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."knockout_round_of_32_third_place_options_view" AS
 WITH "third_place_slots" AS (
         SELECT "kmp"."match_code",
            'home'::"text" AS "slot_side",
            "kmp"."home_slot_label" AS "slot_label",
            "left"("slot_part"."slot_part", 1) AS "allowed_group_letter",
            ('Group '::"text" || "left"("slot_part"."slot_part", 1)) AS "allowed_group_name"
           FROM ("public"."knockout_matches_preview" "kmp"
             CROSS JOIN LATERAL "regexp_split_to_table"("kmp"."home_slot_label", '/'::"text") "slot_part"("slot_part"))
          WHERE (("kmp"."round_key" = 'round_of_32'::"text") AND ("kmp"."home_slot_label" ~ '^[A-L]3(/[A-L]3)+$'::"text") AND ("slot_part"."slot_part" ~ '^[A-L]3$'::"text"))
        UNION ALL
         SELECT "kmp"."match_code",
            'away'::"text" AS "slot_side",
            "kmp"."away_slot_label" AS "slot_label",
            "left"("slot_part"."slot_part", 1) AS "allowed_group_letter",
            ('Group '::"text" || "left"("slot_part"."slot_part", 1)) AS "allowed_group_name"
           FROM ("public"."knockout_matches_preview" "kmp"
             CROSS JOIN LATERAL "regexp_split_to_table"("kmp"."away_slot_label", '/'::"text") "slot_part"("slot_part"))
          WHERE (("kmp"."round_key" = 'round_of_32'::"text") AND ("kmp"."away_slot_label" ~ '^[A-L]3(/[A-L]3)+$'::"text") AND ("slot_part"."slot_part" ~ '^[A-L]3$'::"text"))
        )
 SELECT "tps"."match_code",
    "tps"."slot_side",
    "tps"."slot_label",
    "tps"."allowed_group_letter",
    "tps"."allowed_group_name",
    "gq"."team_id",
    "gq"."group_name",
    "gq"."code",
    "gq"."name_pl",
    "gq"."name_en",
    "gq"."flag_code",
    "gq"."flag_emoji",
    "gq"."played",
    "gq"."wins",
    "gq"."draws",
    "gq"."losses",
    "gq"."goals_for",
    "gq"."goals_against",
    "gq"."goal_difference",
    "gq"."points",
    "gq"."group_position",
    "gq"."third_place_rank",
    "gq"."qualification_status"
   FROM ("third_place_slots" "tps"
     JOIN "public"."group_qualification_view" "gq" ON (("gq"."group_name" = "tps"."allowed_group_name")))
  WHERE (("gq"."group_position" = 3) AND ("gq"."qualification_status" = 'qualified_third_place'::"text"));


ALTER VIEW "public"."knockout_round_of_32_third_place_options_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."match_results_summary_view" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::integer AS "match_number",
    NULL::timestamp with time zone AS "kickoff_time",
    NULL::"public"."match_stage" AS "stage",
    NULL::"text" AS "group_name",
    NULL::integer AS "matchday",
    NULL::"text" AS "venue_city_pl",
    NULL::integer AS "home_score",
    NULL::integer AS "away_score",
    NULL::"public"."match_status" AS "status",
    NULL::"uuid" AS "home_team_id",
    NULL::"text" AS "home_team_code",
    NULL::"text" AS "home_team_name_pl",
    NULL::"text" AS "home_team_flag_code",
    NULL::"text" AS "home_team_flag_emoji",
    NULL::"uuid" AS "away_team_id",
    NULL::"text" AS "away_team_code",
    NULL::"text" AS "away_team_name_pl",
    NULL::"text" AS "away_team_flag_code",
    NULL::"text" AS "away_team_flag_emoji",
    NULL::integer AS "predictions_count",
    NULL::integer AS "exact_scores_count",
    NULL::integer AS "correct_results_count",
    NULL::integer AS "wrong_predictions_count",
    NULL::integer AS "total_points_awarded",
    NULL::"text" AS "match_code",
    NULL::"text" AS "round_key",
    NULL::"text" AS "round_label",
    NULL::"uuid" AS "winner_team_id",
    NULL::"text" AS "winner_team_code",
    NULL::"text" AS "winner_team_name_pl",
    NULL::"text" AS "winner_team_flag_code",
    NULL::"text" AS "winner_team_flag_emoji",
    NULL::"text" AS "resolution_method",
    NULL::integer AS "home_penalty_score",
    NULL::integer AS "away_penalty_score",
    NULL::integer AS "knockout_perfect_predictions_count",
    NULL::integer AS "knockout_method_predictions_count";


ALTER VIEW "public"."match_results_summary_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_username_format" CHECK (("username" ~ '^[a-z0-9_]+$'::"text")),
    CONSTRAINT "profiles_username_length" CHECK ((("char_length"("username") >= 3) AND ("char_length"("username") <= 24)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament_predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "champion_team_id" "uuid" NOT NULL,
    "finalist_team_1_id" "uuid" NOT NULL,
    "finalist_team_2_id" "uuid" NOT NULL,
    "semifinalist_team_1_id" "uuid" NOT NULL,
    "semifinalist_team_2_id" "uuid" NOT NULL,
    "semifinalist_team_3_id" "uuid" NOT NULL,
    "semifinalist_team_4_id" "uuid" NOT NULL,
    "top_scorer_name" "text" NOT NULL,
    "top_scoring_team_id" "uuid" NOT NULL,
    "champion_points" integer,
    "finalist_points" integer,
    "finalist_bonus_points" integer,
    "semifinalist_points" integer,
    "top_scorer_points" integer,
    "top_scoring_team_points" integer,
    "total_points" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tournament_predictions_champion_in_finalists" CHECK ((("champion_team_id" = "finalist_team_1_id") OR ("champion_team_id" = "finalist_team_2_id"))),
    CONSTRAINT "tournament_predictions_finalists_different" CHECK (("finalist_team_1_id" <> "finalist_team_2_id")),
    CONSTRAINT "tournament_predictions_finalists_in_top4" CHECK (((((("finalist_team_1_id" = "semifinalist_team_1_id") OR ("finalist_team_1_id" = "semifinalist_team_2_id")) OR ("finalist_team_1_id" = "semifinalist_team_3_id")) OR ("finalist_team_1_id" = "semifinalist_team_4_id")) AND (((("finalist_team_2_id" = "semifinalist_team_1_id") OR ("finalist_team_2_id" = "semifinalist_team_2_id")) OR ("finalist_team_2_id" = "semifinalist_team_3_id")) OR ("finalist_team_2_id" = "semifinalist_team_4_id")))),
    CONSTRAINT "tournament_predictions_semifinalists_unique" CHECK ((("semifinalist_team_1_id" <> "semifinalist_team_2_id") AND ("semifinalist_team_1_id" <> "semifinalist_team_3_id") AND ("semifinalist_team_1_id" <> "semifinalist_team_4_id") AND ("semifinalist_team_2_id" <> "semifinalist_team_3_id") AND ("semifinalist_team_2_id" <> "semifinalist_team_4_id") AND ("semifinalist_team_3_id" <> "semifinalist_team_4_id"))),
    CONSTRAINT "tournament_predictions_top_scorer_name_length" CHECK (("length"(TRIM(BOTH FROM "top_scorer_name")) >= 2))
);


ALTER TABLE "public"."tournament_predictions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ranking_view" AS
 WITH "match_points" AS (
         SELECT "p"."user_id",
            (COALESCE("sum"("p"."points"), (0)::bigint))::integer AS "match_points",
            ("count"("p"."id"))::integer AS "predictions_count",
            ("count"("p"."id") FILTER (WHERE ("p"."points" = ANY (ARRAY[3, 4]))))::integer AS "exact_scores_count",
            ("count"("p"."id") FILTER (WHERE ("p"."points" = ANY (ARRAY[1, 2]))))::integer AS "correct_results_count",
            ("count"("p"."id") FILTER (WHERE ("p"."points" = 0)))::integer AS "wrong_predictions_count",
            ("count"("p"."id") FILTER (WHERE ("p"."points" = 4)))::integer AS "knockout_perfect_predictions_count",
            ("count"("p"."id") FILTER (WHERE ("p"."points" = 2)))::integer AS "knockout_method_predictions_count"
           FROM "public"."predictions" "p"
          GROUP BY "p"."user_id"
        ), "bonus_points" AS (
         SELECT "tp"."user_id",
            COALESCE("tp"."total_points", 0) AS "tournament_bonus_points"
           FROM "public"."tournament_predictions" "tp"
        )
 SELECT "pr"."id" AS "profile_id",
    "pr"."username",
    "pr"."role",
    COALESCE("mp"."match_points", 0) AS "match_points",
    COALESCE("bp"."tournament_bonus_points", 0) AS "tournament_bonus_points",
    (COALESCE("mp"."match_points", 0) + COALESCE("bp"."tournament_bonus_points", 0)) AS "total_points",
    COALESCE("mp"."predictions_count", 0) AS "predictions_count",
    COALESCE("mp"."exact_scores_count", 0) AS "exact_scores_count",
    COALESCE("mp"."correct_results_count", 0) AS "correct_results_count",
    COALESCE("mp"."wrong_predictions_count", 0) AS "wrong_predictions_count",
    COALESCE("mp"."knockout_perfect_predictions_count", 0) AS "knockout_perfect_predictions_count",
    COALESCE("mp"."knockout_method_predictions_count", 0) AS "knockout_method_predictions_count"
   FROM (("public"."profiles" "pr"
     LEFT JOIN "match_points" "mp" ON (("mp"."user_id" = "pr"."id")))
     LEFT JOIN "bonus_points" "bp" ON (("bp"."user_id" = "pr"."id")));


ALTER VIEW "public"."ranking_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament_bonus_results" (
    "id" smallint DEFAULT 1 NOT NULL,
    "champion_team_id" "uuid",
    "finalist_team_1_id" "uuid",
    "finalist_team_2_id" "uuid",
    "semifinalist_team_1_id" "uuid",
    "semifinalist_team_2_id" "uuid",
    "semifinalist_team_3_id" "uuid",
    "semifinalist_team_4_id" "uuid",
    "top_scorer_name" "text",
    "top_scoring_team_id" "uuid",
    "is_finalized" boolean DEFAULT false NOT NULL,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tournament_bonus_results_champion_in_finalists" CHECK ((("champion_team_id" IS NULL) OR ("finalist_team_1_id" IS NULL) OR ("finalist_team_2_id" IS NULL) OR (("champion_team_id" = "finalist_team_1_id") OR ("champion_team_id" = "finalist_team_2_id")))),
    CONSTRAINT "tournament_bonus_results_finalists_different" CHECK ((("finalist_team_1_id" IS NULL) OR ("finalist_team_2_id" IS NULL) OR ("finalist_team_1_id" <> "finalist_team_2_id"))),
    CONSTRAINT "tournament_bonus_results_finalists_in_top4" CHECK ((("finalist_team_1_id" IS NULL) OR ("finalist_team_2_id" IS NULL) OR ("semifinalist_team_1_id" IS NULL) OR ("semifinalist_team_2_id" IS NULL) OR ("semifinalist_team_3_id" IS NULL) OR ("semifinalist_team_4_id" IS NULL) OR ((((("finalist_team_1_id" = "semifinalist_team_1_id") OR ("finalist_team_1_id" = "semifinalist_team_2_id")) OR ("finalist_team_1_id" = "semifinalist_team_3_id")) OR ("finalist_team_1_id" = "semifinalist_team_4_id")) AND (((("finalist_team_2_id" = "semifinalist_team_1_id") OR ("finalist_team_2_id" = "semifinalist_team_2_id")) OR ("finalist_team_2_id" = "semifinalist_team_3_id")) OR ("finalist_team_2_id" = "semifinalist_team_4_id"))))),
    CONSTRAINT "tournament_bonus_results_finalized_required_fields" CHECK ((("is_finalized" = false) OR (("champion_team_id" IS NOT NULL) AND ("finalist_team_1_id" IS NOT NULL) AND ("finalist_team_2_id" IS NOT NULL) AND ("semifinalist_team_1_id" IS NOT NULL) AND ("semifinalist_team_2_id" IS NOT NULL) AND ("semifinalist_team_3_id" IS NOT NULL) AND ("semifinalist_team_4_id" IS NOT NULL) AND ("top_scorer_name" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "top_scorer_name")) >= 2) AND ("top_scoring_team_id" IS NOT NULL)))),
    CONSTRAINT "tournament_bonus_results_semifinalists_unique" CHECK ((("semifinalist_team_1_id" IS NULL) OR ("semifinalist_team_2_id" IS NULL) OR ("semifinalist_team_3_id" IS NULL) OR ("semifinalist_team_4_id" IS NULL) OR (("semifinalist_team_1_id" <> "semifinalist_team_2_id") AND ("semifinalist_team_1_id" <> "semifinalist_team_3_id") AND ("semifinalist_team_1_id" <> "semifinalist_team_4_id") AND ("semifinalist_team_2_id" <> "semifinalist_team_3_id") AND ("semifinalist_team_2_id" <> "semifinalist_team_4_id") AND ("semifinalist_team_3_id" <> "semifinalist_team_4_id")))),
    CONSTRAINT "tournament_bonus_results_singleton" CHECK (("id" = 1))
);


ALTER TABLE "public"."tournament_bonus_results" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."tournament_predictions_public_view" WITH ("security_invoker"='true') AS
 SELECT "tp"."id",
    "tp"."user_id",
    "p"."username",
    "tp"."champion_team_id",
    "champion"."name_pl" AS "champion_team_name_pl",
    "champion"."code" AS "champion_team_code",
    "champion"."flag_code" AS "champion_team_flag_code",
    "champion"."flag_emoji" AS "champion_team_flag_emoji",
    "tp"."finalist_team_1_id",
    "finalist_1"."name_pl" AS "finalist_team_1_name_pl",
    "finalist_1"."code" AS "finalist_team_1_code",
    "finalist_1"."flag_code" AS "finalist_team_1_flag_code",
    "finalist_1"."flag_emoji" AS "finalist_team_1_flag_emoji",
    "tp"."finalist_team_2_id",
    "finalist_2"."name_pl" AS "finalist_team_2_name_pl",
    "finalist_2"."code" AS "finalist_team_2_code",
    "finalist_2"."flag_code" AS "finalist_team_2_flag_code",
    "finalist_2"."flag_emoji" AS "finalist_team_2_flag_emoji",
    "tp"."semifinalist_team_1_id",
    "semifinalist_1"."name_pl" AS "semifinalist_team_1_name_pl",
    "semifinalist_1"."code" AS "semifinalist_team_1_code",
    "semifinalist_1"."flag_code" AS "semifinalist_team_1_flag_code",
    "semifinalist_1"."flag_emoji" AS "semifinalist_team_1_flag_emoji",
    "tp"."semifinalist_team_2_id",
    "semifinalist_2"."name_pl" AS "semifinalist_team_2_name_pl",
    "semifinalist_2"."code" AS "semifinalist_team_2_code",
    "semifinalist_2"."flag_code" AS "semifinalist_team_2_flag_code",
    "semifinalist_2"."flag_emoji" AS "semifinalist_team_2_flag_emoji",
    "tp"."semifinalist_team_3_id",
    "semifinalist_3"."name_pl" AS "semifinalist_team_3_name_pl",
    "semifinalist_3"."code" AS "semifinalist_team_3_code",
    "semifinalist_3"."flag_code" AS "semifinalist_team_3_flag_code",
    "semifinalist_3"."flag_emoji" AS "semifinalist_team_3_flag_emoji",
    "tp"."semifinalist_team_4_id",
    "semifinalist_4"."name_pl" AS "semifinalist_team_4_name_pl",
    "semifinalist_4"."code" AS "semifinalist_team_4_code",
    "semifinalist_4"."flag_code" AS "semifinalist_team_4_flag_code",
    "semifinalist_4"."flag_emoji" AS "semifinalist_team_4_flag_emoji",
    "tp"."top_scorer_name",
    "tp"."top_scoring_team_id",
    "top_scoring_team"."name_pl" AS "top_scoring_team_name_pl",
    "top_scoring_team"."code" AS "top_scoring_team_code",
    "top_scoring_team"."flag_code" AS "top_scoring_team_flag_code",
    "top_scoring_team"."flag_emoji" AS "top_scoring_team_flag_emoji",
    "tp"."champion_points",
    "tp"."finalist_points",
    "tp"."finalist_bonus_points",
    "tp"."semifinalist_points",
    "tp"."top_scorer_points",
    "tp"."top_scoring_team_points",
    "tp"."total_points",
    "tp"."created_at",
    "tp"."updated_at"
   FROM ((((((((("public"."tournament_predictions" "tp"
     JOIN "public"."profiles" "p" ON (("p"."id" = "tp"."user_id")))
     JOIN "public"."teams" "champion" ON (("champion"."id" = "tp"."champion_team_id")))
     JOIN "public"."teams" "finalist_1" ON (("finalist_1"."id" = "tp"."finalist_team_1_id")))
     JOIN "public"."teams" "finalist_2" ON (("finalist_2"."id" = "tp"."finalist_team_2_id")))
     JOIN "public"."teams" "semifinalist_1" ON (("semifinalist_1"."id" = "tp"."semifinalist_team_1_id")))
     JOIN "public"."teams" "semifinalist_2" ON (("semifinalist_2"."id" = "tp"."semifinalist_team_2_id")))
     JOIN "public"."teams" "semifinalist_3" ON (("semifinalist_3"."id" = "tp"."semifinalist_team_3_id")))
     JOIN "public"."teams" "semifinalist_4" ON (("semifinalist_4"."id" = "tp"."semifinalist_team_4_id")))
     JOIN "public"."teams" "top_scoring_team" ON (("top_scoring_team"."id" = "tp"."top_scoring_team_id")));


ALTER VIEW "public"."tournament_predictions_public_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournament_settings" (
    "id" smallint DEFAULT 1 NOT NULL,
    "tournament_predictions_deadline" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tournament_settings_singleton" CHECK (("id" = 1))
);


ALTER TABLE "public"."tournament_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."knockout_match_links"
    ADD CONSTRAINT "knockout_match_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_match_code_key" UNIQUE ("match_code");



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_match_number_unique" UNIQUE ("match_number");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_unique_user_match" UNIQUE ("user_id", "match_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_user_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."tournament_settings"
    ADD CONSTRAINT "tournament_settings_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "knockout_match_links_unique_source_target" ON "public"."knockout_match_links" USING "btree" ("source_match_code", "target_match_code", "target_slot", "source_result");



CREATE UNIQUE INDEX "knockout_match_links_unique_target_slot" ON "public"."knockout_match_links" USING "btree" ("target_match_code", "target_slot");



CREATE INDEX "knockout_preview_away_team_id_idx" ON "public"."knockout_matches_preview" USING "btree" ("away_team_id");



CREATE INDEX "knockout_preview_home_team_id_idx" ON "public"."knockout_matches_preview" USING "btree" ("home_team_id");



CREATE INDEX "knockout_preview_is_confirmed_idx" ON "public"."knockout_matches_preview" USING "btree" ("is_confirmed");



CREATE INDEX "knockout_preview_match_id_idx" ON "public"."knockout_matches_preview" USING "btree" ("match_id");



CREATE INDEX "knockout_preview_round_key_idx" ON "public"."knockout_matches_preview" USING "btree" ("round_key");



CREATE INDEX "matches_away_team_id_idx" ON "public"."matches" USING "btree" ("away_team_id");



CREATE INDEX "matches_group_name_idx" ON "public"."matches" USING "btree" ("group_name");



CREATE INDEX "matches_home_team_id_idx" ON "public"."matches" USING "btree" ("home_team_id");



CREATE INDEX "matches_kickoff_time_idx" ON "public"."matches" USING "btree" ("kickoff_time");



CREATE UNIQUE INDEX "matches_match_code_unique" ON "public"."matches" USING "btree" ("match_code") WHERE ("match_code" IS NOT NULL);



CREATE INDEX "matches_resolution_method_idx" ON "public"."matches" USING "btree" ("resolution_method");



CREATE INDEX "matches_round_key_idx" ON "public"."matches" USING "btree" ("round_key");



CREATE INDEX "matches_stage_idx" ON "public"."matches" USING "btree" ("stage");



CREATE INDEX "matches_stage_round_key_idx" ON "public"."matches" USING "btree" ("stage", "round_key");



CREATE INDEX "matches_status_idx" ON "public"."matches" USING "btree" ("status");



CREATE INDEX "matches_winner_team_id_idx" ON "public"."matches" USING "btree" ("winner_team_id");



CREATE INDEX "predictions_match_id_idx" ON "public"."predictions" USING "btree" ("match_id");



CREATE INDEX "predictions_predicted_resolution_method_idx" ON "public"."predictions" USING "btree" ("predicted_resolution_method");



CREATE INDEX "predictions_predicted_winner_team_id_idx" ON "public"."predictions" USING "btree" ("predicted_winner_team_id");



CREATE INDEX "predictions_user_id_idx" ON "public"."predictions" USING "btree" ("user_id");



CREATE INDEX "profiles_username_idx" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "teams_group_name_idx" ON "public"."teams" USING "btree" ("group_name");



CREATE OR REPLACE VIEW "public"."match_results_summary_view" AS
 SELECT "m"."id",
    "m"."match_number",
    "m"."kickoff_time",
    "m"."stage",
    "m"."group_name",
    "m"."matchday",
    "m"."venue_city_pl",
    "m"."home_score",
    "m"."away_score",
    "m"."status",
    "home_team"."id" AS "home_team_id",
    "home_team"."code" AS "home_team_code",
    "home_team"."name_pl" AS "home_team_name_pl",
    "home_team"."flag_code" AS "home_team_flag_code",
    "home_team"."flag_emoji" AS "home_team_flag_emoji",
    "away_team"."id" AS "away_team_id",
    "away_team"."code" AS "away_team_code",
    "away_team"."name_pl" AS "away_team_name_pl",
    "away_team"."flag_code" AS "away_team_flag_code",
    "away_team"."flag_emoji" AS "away_team_flag_emoji",
    ("count"("p"."id"))::integer AS "predictions_count",
    ("count"("p"."id") FILTER (WHERE ("p"."points" = ANY (ARRAY[3, 4]))))::integer AS "exact_scores_count",
    ("count"("p"."id") FILTER (WHERE ("p"."points" = ANY (ARRAY[1, 2]))))::integer AS "correct_results_count",
    ("count"("p"."id") FILTER (WHERE ("p"."points" = 0)))::integer AS "wrong_predictions_count",
    (COALESCE("sum"("p"."points"), (0)::bigint))::integer AS "total_points_awarded",
    "m"."match_code",
        CASE
            WHEN ("m"."stage" = 'group_stage'::"public"."match_stage") THEN NULL::"text"
            ELSE ("m"."stage")::"text"
        END AS "round_key",
    "m"."round_label",
    "m"."winner_team_id",
    "winner_team"."code" AS "winner_team_code",
    "winner_team"."name_pl" AS "winner_team_name_pl",
    "winner_team"."flag_code" AS "winner_team_flag_code",
    "winner_team"."flag_emoji" AS "winner_team_flag_emoji",
    "m"."resolution_method",
    "m"."home_penalty_score",
    "m"."away_penalty_score",
    ("count"("p"."id") FILTER (WHERE ("p"."points" = 4)))::integer AS "knockout_perfect_predictions_count",
    ("count"("p"."id") FILTER (WHERE ("p"."points" = 2)))::integer AS "knockout_method_predictions_count"
   FROM (((("public"."matches" "m"
     JOIN "public"."teams" "home_team" ON (("home_team"."id" = "m"."home_team_id")))
     JOIN "public"."teams" "away_team" ON (("away_team"."id" = "m"."away_team_id")))
     LEFT JOIN "public"."teams" "winner_team" ON (("winner_team"."id" = "m"."winner_team_id")))
     LEFT JOIN "public"."predictions" "p" ON (("p"."match_id" = "m"."id")))
  WHERE ("m"."status" = 'finished'::"public"."match_status")
  GROUP BY "m"."id", "home_team"."id", "away_team"."id", "winner_team"."id";



CREATE OR REPLACE TRIGGER "set_matches_updated_at" BEFORE UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_predictions_updated_at" BEFORE UPDATE ON "public"."predictions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tournament_bonus_results_updated_at" BEFORE UPDATE ON "public"."tournament_bonus_results" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tournament_predictions_updated_at" BEFORE UPDATE ON "public"."tournament_predictions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tournament_settings_updated_at" BEFORE UPDATE ON "public"."tournament_settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."knockout_match_links"
    ADD CONSTRAINT "knockout_match_links_source_match_code_fkey" FOREIGN KEY ("source_match_code") REFERENCES "public"."knockout_matches_preview"("match_code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knockout_match_links"
    ADD CONSTRAINT "knockout_match_links_target_match_code_fkey" FOREIGN KEY ("target_match_code") REFERENCES "public"."knockout_matches_preview"("match_code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."knockout_matches_preview"
    ADD CONSTRAINT "knockout_matches_preview_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_winner_team_id_fkey" FOREIGN KEY ("winner_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_predicted_winner_team_id_fkey" FOREIGN KEY ("predicted_winner_team_id") REFERENCES "public"."teams"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_champion_team_id_fkey" FOREIGN KEY ("champion_team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_finalist_team_1_id_fkey" FOREIGN KEY ("finalist_team_1_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_finalist_team_2_id_fkey" FOREIGN KEY ("finalist_team_2_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_semifinalist_team_1_id_fkey" FOREIGN KEY ("semifinalist_team_1_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_semifinalist_team_2_id_fkey" FOREIGN KEY ("semifinalist_team_2_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_semifinalist_team_3_id_fkey" FOREIGN KEY ("semifinalist_team_3_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_semifinalist_team_4_id_fkey" FOREIGN KEY ("semifinalist_team_4_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_top_scoring_team_id_fkey" FOREIGN KEY ("top_scoring_team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_bonus_results"
    ADD CONSTRAINT "tournament_bonus_results_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_champion_team_id_fkey" FOREIGN KEY ("champion_team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_finalist_team_1_id_fkey" FOREIGN KEY ("finalist_team_1_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_finalist_team_2_id_fkey" FOREIGN KEY ("finalist_team_2_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_semifinalist_team_1_id_fkey" FOREIGN KEY ("semifinalist_team_1_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_semifinalist_team_2_id_fkey" FOREIGN KEY ("semifinalist_team_2_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_semifinalist_team_3_id_fkey" FOREIGN KEY ("semifinalist_team_3_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_semifinalist_team_4_id_fkey" FOREIGN KEY ("semifinalist_team_4_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_top_scoring_team_id_fkey" FOREIGN KEY ("top_scoring_team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."tournament_predictions"
    ADD CONSTRAINT "tournament_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can insert tournament bonus results" ON "public"."tournament_bonus_results" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage knockout match links" ON "public"."knockout_match_links" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage knockout matches preview" ON "public"."knockout_matches_preview" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage matches" ON "public"."matches" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage predictions" ON "public"."predictions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage profiles" ON "public"."profiles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage teams" ON "public"."teams" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can read all tournament predictions" ON "public"."tournament_predictions" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can update all tournament predictions" ON "public"."tournament_predictions" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update tournament bonus results" ON "public"."tournament_bonus_results" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update tournament settings" ON "public"."tournament_settings" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Matches are readable by authenticated users" ON "public"."matches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Profiles are readable by authenticated users" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public can read knockout match links" ON "public"."knockout_match_links" FOR SELECT USING (true);



CREATE POLICY "Public can read knockout matches preview" ON "public"."knockout_matches_preview" FOR SELECT USING (true);



CREATE POLICY "Teams are readable by authenticated users" ON "public"."teams" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can delete own predictions before kickoff" ON "public"."predictions" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "predictions"."match_id") AND ("matches"."kickoff_time" > "now"()) AND ("matches"."status" = 'scheduled'::"public"."match_status"))))));



CREATE POLICY "Users can insert own predictions" ON "public"."predictions" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "predictions"."match_id") AND ("matches"."kickoff_time" > "now"()) AND ("matches"."status" = 'scheduled'::"public"."match_status"))))));



CREATE POLICY "Users can insert own tournament predictions before start" ON "public"."tournament_predictions" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ("public"."is_tournament_started"() = false)));



CREATE POLICY "Users can read all tournament predictions after start" ON "public"."tournament_predictions" FOR SELECT TO "authenticated" USING (("public"."is_tournament_started"() = true));



CREATE POLICY "Users can read allowed predictions" ON "public"."predictions" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"() OR "public"."is_match_started"("match_id")));



CREATE POLICY "Users can read own tournament predictions" ON "public"."tournament_predictions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read tournament bonus results" ON "public"."tournament_bonus_results" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can read tournament settings" ON "public"."tournament_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update own predictions before kickoff" ON "public"."predictions" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "predictions"."match_id") AND ("matches"."kickoff_time" > "now"()) AND ("matches"."status" = 'scheduled'::"public"."match_status")))))) WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "predictions"."match_id") AND ("matches"."kickoff_time" > "now"()) AND ("matches"."status" = 'scheduled'::"public"."match_status"))))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can update own tournament predictions before start" ON "public"."tournament_predictions" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") AND ("public"."is_tournament_started"() = false))) WITH CHECK ((("auth"."uid"() = "user_id") AND ("public"."is_tournament_started"() = false)));



ALTER TABLE "public"."knockout_match_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knockout_matches_preview" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_bonus_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournament_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."confirm_round_of_32_bracket"("third_place_selections" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."confirm_round_of_32_bracket"("third_place_selections" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_round_of_32_bracket"("third_place_selections" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_match_started"("match_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_match_started"("match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_match_started"("match_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_tournament_started"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_tournament_started"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_tournament_started"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_username_available"("input_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_username_available"("input_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_username_available"("input_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_round_of_32_confirmation"("third_place_selections" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_round_of_32_confirmation"("third_place_selections" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_round_of_32_confirmation"("third_place_selections" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."matches_view" TO "anon";
GRANT ALL ON TABLE "public"."matches_view" TO "authenticated";
GRANT ALL ON TABLE "public"."matches_view" TO "service_role";



GRANT ALL ON TABLE "public"."predictions" TO "anon";
GRANT ALL ON TABLE "public"."predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."predictions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_matches_overview_view" TO "anon";
GRANT ALL ON TABLE "public"."admin_matches_overview_view" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_matches_overview_view" TO "service_role";



GRANT ALL ON TABLE "public"."group_qualification_view" TO "anon";
GRANT ALL ON TABLE "public"."group_qualification_view" TO "authenticated";
GRANT ALL ON TABLE "public"."group_qualification_view" TO "service_role";



GRANT ALL ON TABLE "public"."group_standings_view" TO "anon";
GRANT ALL ON TABLE "public"."group_standings_view" TO "authenticated";
GRANT ALL ON TABLE "public"."group_standings_view" TO "service_role";



GRANT ALL ON TABLE "public"."knockout_matches_preview" TO "anon";
GRANT ALL ON TABLE "public"."knockout_matches_preview" TO "authenticated";
GRANT ALL ON TABLE "public"."knockout_matches_preview" TO "service_role";



GRANT ALL ON TABLE "public"."knockout_round_of_32_proposal_view" TO "anon";
GRANT ALL ON TABLE "public"."knockout_round_of_32_proposal_view" TO "authenticated";
GRANT ALL ON TABLE "public"."knockout_round_of_32_proposal_view" TO "service_role";



GRANT ALL ON TABLE "public"."knockout_admin_readiness_view" TO "anon";
GRANT ALL ON TABLE "public"."knockout_admin_readiness_view" TO "authenticated";
GRANT ALL ON TABLE "public"."knockout_admin_readiness_view" TO "service_role";



GRANT ALL ON TABLE "public"."knockout_match_links" TO "anon";
GRANT ALL ON TABLE "public"."knockout_match_links" TO "authenticated";
GRANT ALL ON TABLE "public"."knockout_match_links" TO "service_role";



GRANT ALL ON TABLE "public"."knockout_round_of_32_third_place_options_view" TO "anon";
GRANT ALL ON TABLE "public"."knockout_round_of_32_third_place_options_view" TO "authenticated";
GRANT ALL ON TABLE "public"."knockout_round_of_32_third_place_options_view" TO "service_role";



GRANT ALL ON TABLE "public"."match_results_summary_view" TO "anon";
GRANT ALL ON TABLE "public"."match_results_summary_view" TO "authenticated";
GRANT ALL ON TABLE "public"."match_results_summary_view" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."tournament_predictions" TO "anon";
GRANT ALL ON TABLE "public"."tournament_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_predictions" TO "service_role";



GRANT ALL ON TABLE "public"."ranking_view" TO "anon";
GRANT ALL ON TABLE "public"."ranking_view" TO "authenticated";
GRANT ALL ON TABLE "public"."ranking_view" TO "service_role";



GRANT ALL ON TABLE "public"."tournament_bonus_results" TO "anon";
GRANT ALL ON TABLE "public"."tournament_bonus_results" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_bonus_results" TO "service_role";



GRANT ALL ON TABLE "public"."tournament_predictions_public_view" TO "anon";
GRANT ALL ON TABLE "public"."tournament_predictions_public_view" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_predictions_public_view" TO "service_role";



GRANT ALL ON TABLE "public"."tournament_settings" TO "anon";
GRANT ALL ON TABLE "public"."tournament_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."tournament_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































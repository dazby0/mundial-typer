select
  proname,
  pg_get_function_arguments(oid) as arguments
from pg_proc
where proname = 'advance_knockout_result';
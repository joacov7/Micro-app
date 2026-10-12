-- Regla de seguridad (CLAUDE.md §8): toda tabla del esquema public tiene RLS activado
-- y los visitantes anónimos no tienen permisos de escritura sobre ninguna.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(2);

select is(
  array(
    select c.relname::text from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    order by 1
  ),
  array[]::text[],
  'todas las tablas de public tienen Row Level Security'
);

select is(
  array(
    select distinct table_name::text from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    order by 1
  ),
  array[]::text[],
  'los visitantes anónimos no pueden escribir en ninguna tabla'
);

select * from finish();
rollback;

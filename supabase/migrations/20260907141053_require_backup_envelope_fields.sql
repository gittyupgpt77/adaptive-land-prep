alter table public.athlete_backups add constraint backup_required_fields
check (payload ?& array['app','formatVersion','data']
 and payload->'data' <> 'null'::jsonb
 and payload->'app' <> 'null'::jsonb
 and payload->'formatVersion' <> 'null'::jsonb);

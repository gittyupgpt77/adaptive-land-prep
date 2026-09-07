begin;
insert into auth.users(id) values ('f1111111-1111-4111-8111-111111111111'),('f2222222-2222-4222-8222-222222222222');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"f1111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',true);
insert into public.athlete_backups(user_id,payload) values
 ('f1111111-1111-4111-8111-111111111111','{"app":"Adaptive Land Prep","formatVersion":3,"data":{"trainingLogs":"[]"}}');
do $$ begin
 if (select count(*) from public.athlete_backups) <> 1 then raise exception 'Owner read failed'; end if;
 begin
 insert into public.athlete_backups(user_id,payload) values ('f2222222-2222-4222-8222-222222222222','{"app":"Adaptive Land Prep","formatVersion":3,"data":{}}');
 raise exception 'Cross-user insert allowed';
 exception when insufficient_privilege then null; end;
 begin
 update public.athlete_backups set user_id='f2222222-2222-4222-8222-222222222222';
 raise exception 'Snapshot update allowed';
 exception when insufficient_privilege then null; end;
 begin
 delete from public.athlete_backups;
 raise exception 'Snapshot delete allowed';
 exception when insufficient_privilege then null; end;
 begin
 insert into public.athlete_backups(user_id,payload) values ('f1111111-1111-4111-8111-111111111111','{}');
 raise exception 'Invalid envelope accepted';
 exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"f2222222-2222-4222-8222-222222222222","role":"authenticated","is_anonymous":false}',true);
do $$ begin
 if exists(select 1 from public.athlete_backups) then raise exception 'Cross-user read allowed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"f1111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":true}',true);
do $$ begin
 if exists(select 1 from public.athlete_backups) then raise exception 'Anonymous identity read allowed'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform * from public.athlete_backups; raise exception 'Unauthenticated read allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'passed: owner read/write, cross-user isolation, immutable history, envelope validation, anonymous denial; fixtures rolled back' as result;

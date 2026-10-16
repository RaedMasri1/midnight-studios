-- Run once in Supabase SQL Editor. No passwords or service keys belong here.
begin;
create table public.cms_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.cms_admins enable row level security;
create function public.cms_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.cms_admins where user_id=(select auth.uid()));
$$;
revoke all on function public.cms_is_admin() from public;
grant execute on function public.cms_is_admin() to authenticated;
create policy "Admins can see their membership" on public.cms_admins for select to authenticated using (user_id=(select auth.uid()));
grant select on public.cms_admins to authenticated;

create table public.cms_documents (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('game','post')),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 data jsonb not null check(jsonb_typeof(data)='object' and data->>'slug'=slug and data->>'publication' in ('draft','published')),
 sort_order integer not null default 0,
 revision integer not null default 1,
 updated_at timestamptz not null default now(), unique(kind,slug)
);
alter table public.cms_documents enable row level security;
create policy "Only studio admins read drafts" on public.cms_documents for select to authenticated using ((select public.cms_is_admin()));
grant select on public.cms_documents to authenticated;
-- Mutations use guarded RPCs, not direct client table writes.
revoke insert,update,delete on public.cms_documents from anon,authenticated;

create table public.cms_publication (id boolean primary key default true check(id),snapshot jsonb not null,updated_at timestamptz not null default now());
create table public.cms_site_config (id boolean primary key default true check(id),home jsonb not null);
alter table public.cms_site_config enable row level security;
alter table public.cms_publication enable row level security;
create policy "Published snapshot is public" on public.cms_publication for select to anon,authenticated using (true);
grant select on public.cms_publication to anon,authenticated;
create table public.cms_publication_history (id bigint generated always as identity primary key,snapshot jsonb not null,created_at timestamptz not null default now());
alter table public.cms_publication_history enable row level security;
create policy "Admins read publication history" on public.cms_publication_history for select to authenticated using ((select public.cms_is_admin()));
grant select on public.cms_publication_history to authenticated;

create table public.cms_store_cache (id boolean primary key default true check(id),reviews jsonb not null default '[]',updated_at timestamptz,detail text);
insert into public.cms_store_cache(id) values(true);
alter table public.cms_store_cache enable row level security;
create policy "Admins read sync state" on public.cms_store_cache for select to authenticated using ((select public.cms_is_admin()));
grant select on public.cms_store_cache to authenticated;

create function public.cms_save(p_id uuid,p_kind text,p_data jsonb,p_revision integer) returns public.cms_documents language plpgsql security definer set search_path='' as $$
declare result public.cms_documents;
begin
 if not public.cms_is_admin() then raise exception 'Admin access required'; end if;
 if p_revision=0 then
  insert into public.cms_documents(id,kind,slug,data,sort_order) values(p_id,p_kind,p_data->>'slug',p_data,(select coalesce(max(sort_order),0)+1 from public.cms_documents where kind=p_kind)) returning * into result;
 else
  update public.cms_documents set slug=p_data->>'slug',data=p_data,revision=revision+1,updated_at=clock_timestamp() where id=p_id and kind=p_kind and revision=p_revision returning * into result;
  if not found then raise exception 'This record changed in another session. Reload before saving.'; end if;
 end if;
 return result;
end; $$;

create function public.cms_delete(p_id uuid,p_revision integer) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.cms_is_admin() then raise exception 'Admin access required'; end if;
 delete from public.cms_documents where id=p_id and revision=p_revision;
 if not found then raise exception 'This record changed. Reload before deleting.'; end if;
end; $$;

create function public.cms_reorder(p_rows jsonb) returns void language plpgsql security definer set search_path='' as $$
declare item jsonb; n integer:=0;
begin
 if not public.cms_is_admin() then raise exception 'Admin access required'; end if;
 perform 1 from public.cms_documents where kind='game' order by id for update;
 if jsonb_array_length(p_rows)<>(select count(*) from public.cms_documents where kind='game') or
    (select count(distinct r->>'id') from jsonb_array_elements(p_rows) r)<>jsonb_array_length(p_rows) then raise exception 'Games changed. Reload before ordering.'; end if;
 for item in select * from jsonb_array_elements(p_rows) loop
  update public.cms_documents set sort_order=n,revision=revision+1,updated_at=clock_timestamp() where id=(item->>'id')::uuid and kind='game' and revision=(item->>'revision')::int;
  if not found then raise exception 'Game order changed in another session. Reload.'; end if;
  n:=n+1;
 end loop;
end; $$;

create function public.cms_initialize(p_snapshot jsonb) returns void language plpgsql security definer set search_path='' as $$
declare item jsonb; n integer:=0;
begin
 if not public.cms_is_admin() then raise exception 'Admin access required'; end if;
 perform pg_advisory_xact_lock(684719);
 if exists(select 1 from public.cms_documents) or exists(select 1 from public.cms_publication) then raise exception 'Content already exists. Initialization will not overwrite it.'; end if;
 for item in select * from jsonb_array_elements(p_snapshot->'games') loop
  insert into public.cms_documents(kind,slug,data,sort_order) values('game',item->>'slug',item,n); n:=n+1;
 end loop;
 for item in select * from jsonb_array_elements(p_snapshot->'posts') loop
  insert into public.cms_documents(kind,slug,data) values('post',item->>'slug',item);
 end loop;
 insert into public.cms_site_config(id,home) values(true,p_snapshot->'home');
 insert into public.cms_publication(id,snapshot) values(true,p_snapshot);
 update public.cms_store_cache set reviews=coalesce(p_snapshot->'reviews','[]'::jsonb) where id;
end; $$;

create function public.cms_publish(p_revisions jsonb,p_expected timestamptz) returns timestamptz language plpgsql security definer set search_path='' as $$
declare previous public.cms_publication; result jsonb; item jsonb; stamp timestamptz:=clock_timestamp();
begin
 if not public.cms_is_admin() then raise exception 'Admin access required'; end if;
 select * into previous from public.cms_publication where id for update;
 if not found then raise exception 'Initialize studio content first.'; end if;
 if previous.updated_at is distinct from p_expected then raise exception 'Another publication happened. Reload before publishing.'; end if;
 perform 1 from public.cms_documents order by id for update;
 if jsonb_array_length(p_revisions)<>(select count(*) from public.cms_documents) or (select count(distinct r->>'id') from jsonb_array_elements(p_revisions) r)<>jsonb_array_length(p_revisions) then raise exception 'Content changed. Reload before publishing.'; end if;
 for item in select * from jsonb_array_elements(p_revisions) loop
  if not exists(select 1 from public.cms_documents where id=(item->>'id')::uuid and revision=(item->>'revision')::int) then raise exception 'Content changed. Reload before publishing.'; end if;
 end loop;
 result:=jsonb_build_object(
  'games',coalesce((select jsonb_agg(data order by sort_order,id) from public.cms_documents where kind='game' and data->>'publication'='published'),'[]'::jsonb),
  'posts',coalesce((select jsonb_agg(data order by data->>'publishedAt' desc,id) from public.cms_documents where kind='post' and data->>'publication'='published'),'[]'::jsonb),
  'home',(select home from public.cms_site_config where id),
  'reviews',coalesce((select jsonb_agg(r) from public.cms_store_cache c,jsonb_array_elements(c.reviews) r where exists(select 1 from public.cms_documents d where d.kind='game' and d.slug=r->>'gameSlug' and d.data->>'publication'='published')),'[]'::jsonb));
 -- Hide absent game scenes without discarding their original configuration.
 -- Republishing a previously hidden game restores its existing scene.
 result:=jsonb_set(result,'{home,upcomingChapters}',coalesce((select jsonb_agg(c) from jsonb_array_elements(result->'home'->'upcomingChapters') c where exists(select 1 from jsonb_array_elements(result->'games') g where g->>'slug'=c->>'gameSlug')),'[]'::jsonb));
 if not exists(select 1 from jsonb_array_elements(result->'games') g where g->>'slug'=result->'home'->'feature'->>'gameSlug') then result:=jsonb_set(result,'{home,feature,enabled}','false'); end if;
 if not exists(select 1 from jsonb_array_elements(result->'games') g where g->>'slug'=result->'home'->'secondaryFeature'->>'gameSlug') then result:=jsonb_set(result,'{home,secondaryFeature,enabled}','false'); end if;
 if exists(select 1 from jsonb_array_elements(result->'posts') p where p->>'gameSlug' is not null and not exists(select 1 from jsonb_array_elements(result->'games') g where g->>'slug'=p->>'gameSlug')) then raise exception 'A published journal links to a hidden game.'; end if;
 insert into public.cms_publication_history(snapshot) values(previous.snapshot);
 delete from public.cms_publication_history where id not in(select id from public.cms_publication_history order by id desc limit 10);
 update public.cms_publication set snapshot=result,updated_at=stamp where id;
 return stamp;
end; $$;

revoke all on function public.cms_save(uuid,text,jsonb,integer),public.cms_delete(uuid,integer),public.cms_reorder(jsonb),public.cms_initialize(jsonb),public.cms_publish(jsonb,timestamptz) from public;
grant execute on function public.cms_save(uuid,text,jsonb,integer),public.cms_delete(uuid,integer),public.cms_reorder(jsonb),public.cms_initialize(jsonb),public.cms_publish(jsonb,timestamptz) to authenticated;

-- Only the authenticated server job may replace official review data.
create function public.cms_set_reviews(p_reviews jsonb,p_detail text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if jsonb_typeof(p_reviews)<>'array' then raise exception 'Reviews must be an array'; end if;
 update public.cms_store_cache set reviews=p_reviews,updated_at=clock_timestamp(),detail=p_detail where id;
 update public.cms_publication set snapshot=jsonb_set(snapshot,'{reviews}',coalesce((select jsonb_agg(r) from jsonb_array_elements(p_reviews) r where exists(select 1 from jsonb_array_elements(snapshot->'games') g where g->>'slug'=r->>'gameSlug')),'[]'::jsonb)),updated_at=clock_timestamp() where id;
end; $$;
revoke all on function public.cms_set_reviews(jsonb,text) from public;
grant execute on function public.cms_set_reviews(jsonb,text) to service_role;
create table public.cms_job_lease(id boolean primary key default true check(id),until_at timestamptz not null default '-infinity');
insert into public.cms_job_lease(id) values(true);
alter table public.cms_job_lease enable row level security;
create function public.cms_acquire_review_lease() returns boolean language plpgsql security invoker set search_path='' as $$
begin
 update public.cms_job_lease set until_at=clock_timestamp()+interval '10 minutes' where id and until_at<clock_timestamp();
 return found;
end; $$;
create function public.cms_release_review_lease() returns void language sql security invoker set search_path='' as $$ update public.cms_job_lease set until_at='-infinity' where id; $$;
revoke all on function public.cms_acquire_review_lease(),public.cms_release_review_lease() from public;
grant execute on function public.cms_acquire_review_lease(),public.cms_release_review_lease() to service_role;
grant select on public.cms_admins,public.cms_publication to service_role;
grant select,update on public.cms_store_cache,public.cms_publication,public.cms_job_lease to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-media','studio-media',true,52428800,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy "Public studio photos" on storage.objects for select to anon,authenticated using(bucket_id='studio-media');
create policy "Admins upload original photos" on storage.objects for insert to authenticated with check(bucket_id='studio-media' and (select public.cms_is_admin()) and name ~ '^admin-[a-f0-9-]+\.(png|jpg|webp)$');
-- Media is append-only: replacing a photo creates a new object. Old publications remain valid.
-- Supabase projects may have broad DEFAULT PRIVILEGES. Explicitly reset them
-- for every CMS relation/function; RLS does not guard TRUNCATE permissions.
revoke all on public.cms_admins,public.cms_documents,public.cms_site_config,public.cms_publication,public.cms_publication_history,public.cms_store_cache,public.cms_job_lease from public,anon,authenticated;
grant select on public.cms_publication to anon,authenticated;
grant select on public.cms_admins,public.cms_documents,public.cms_publication_history,public.cms_store_cache to authenticated;
revoke all on function public.cms_is_admin(),public.cms_save(uuid,text,jsonb,integer),public.cms_delete(uuid,integer),public.cms_reorder(jsonb),public.cms_initialize(jsonb),public.cms_publish(jsonb,timestamptz),public.cms_set_reviews(jsonb,text),public.cms_acquire_review_lease(),public.cms_release_review_lease() from public,anon,authenticated;
grant execute on function public.cms_is_admin(),public.cms_save(uuid,text,jsonb,integer),public.cms_delete(uuid,integer),public.cms_reorder(jsonb),public.cms_initialize(jsonb),public.cms_publish(jsonb,timestamptz) to authenticated;
grant execute on function public.cms_set_reviews(jsonb,text),public.cms_acquire_review_lease(),public.cms_release_review_lease() to service_role;
commit;

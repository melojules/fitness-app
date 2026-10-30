-- Apply once in the Supabase SQL editor or with Supabase migrations.
begin;

create table public.member_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  request_message text not null default '' check (char_length(request_message) <= 1000),
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);
create index member_accounts_review_queue on public.member_accounts(status, created_at);
alter table public.member_accounts enable row level security;

create function public.create_member_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Never accept role/status from user-editable signup metadata.
  insert into public.member_accounts(id, email, display_name, request_message, email_verified)
  values (new.id, new.email,
    left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Member'), 80),
    left(coalesce(new.raw_user_meta_data->>'request_message', ''), 1000),
    new.email_confirmed_at is not null);
  return new;
end;
$$;
create trigger on_fitness_user_created after insert on auth.users
for each row execute procedure public.create_member_account();

create function public.sync_member_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.member_accounts set email = new.email,
    email_verified = new.email_confirmed_at is not null where id = new.id;
  return new;
end;
$$;
create trigger on_fitness_email_changed after update of email, email_confirmed_at on auth.users
for each row execute procedure public.sync_member_email();

create function public.is_fitness_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.member_accounts
    where id = (select auth.uid()) and role = 'admin'
      and status = 'approved' and email_verified);
$$;

create policy member_read_self_or_admin on public.member_accounts
for select to authenticated using (id = (select auth.uid()) or (select public.is_fitness_admin()));

-- Only this audited operation can change approval status through the client API.
create function public.review_registration(target_user_id uuid, decision text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_fitness_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if decision not in ('approved', 'rejected') or decision is null then
    raise exception 'Invalid review decision' using errcode = '22023';
  end if;
  update public.member_accounts set status = decision, reviewed_at = now(), reviewed_by = auth.uid()
  where id = target_user_id and role = 'user' and status = 'pending'
    and (decision = 'rejected' or email_verified);
  if not found then
    raise exception 'Request already reviewed, missing, or email not verified' using errcode = '22023';
  end if;
end;
$$;

revoke all on public.member_accounts from anon, authenticated;
grant select on public.member_accounts to authenticated;
revoke all on function public.create_member_account() from public, anon, authenticated;
revoke all on function public.sync_member_email() from public, anon, authenticated;
revoke all on function public.is_fitness_admin() from public, anon;
revoke all on function public.review_registration(uuid, text) from public, anon;
grant execute on function public.is_fitness_admin() to authenticated;
grant execute on function public.review_registration(uuid, text) to authenticated;

-- Existing Auth users become pending members too; nobody is auto-promoted.
insert into public.member_accounts(id, email, display_name, email_verified)
select id, email, left(coalesce(nullif(btrim(raw_user_meta_data->>'display_name'), ''), 'Member'), 80),
  email_confirmed_at is not null from auth.users on conflict (id) do nothing;
commit;

-- Own-post save counts + forbid saving your own post.
--
-- The `wishlist` SELECT policy is `auth.uid() = user_id`, so a client can only
-- read its *own* saves. That makes it impossible to count, from the client, how
-- many *other* people saved one of your recommendations — the number always
-- comes back as 0. `get_own_save_counts` closes that gap with a SECURITY DEFINER
-- function that returns save counts, but only for the caller's own activities,
-- and only as aggregate counts (never the savers' identities).
--
-- We also harden the INSERT policy so a user cannot save their own post at all
-- (the product rule "you can't bookmark your own recommendation"), enforced
-- server-side rather than only hidden in the UI.

-- Save counts for the caller's own activities. Self-saves (if any legacy rows
-- exist) are excluded, so the number reflects *other* people only. Returns no
-- rows when auth.uid() is null or none of your posts have been saved.
create or replace function public.get_own_save_counts()
returns table (activity_id uuid, save_count bigint)
language sql
security definer
set search_path = public
as $$
  select w.activity_id, count(*)::bigint as save_count
  from public.wishlist w
  join public.activities a on a.id = w.activity_id
  where a.user_id = auth.uid()
    and w.user_id <> a.user_id
  group by w.activity_id;
$$;

revoke execute on function public.get_own_save_counts() from anon;
grant execute on function public.get_own_save_counts() to authenticated;

-- Forbid saving your own recommendation. Still requires the row to belong to the
-- caller (unchanged), and additionally rejects it when the referenced activity
-- is the caller's own.
drop policy if exists wishlist_insert_own on public.wishlist;
create policy wishlist_insert_own on public.wishlist
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.activities a
      where a.id = wishlist.activity_id
        and a.user_id = (select auth.uid())
    )
  );

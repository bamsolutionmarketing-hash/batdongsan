-- Re-roll edits a post's caption in place, so the owner needs UPDATE on
-- generated_posts. 0004 only granted select/insert; without this the update is
-- silently dropped by RLS (0 rows affected, no error).
create policy posts_update on generated_posts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

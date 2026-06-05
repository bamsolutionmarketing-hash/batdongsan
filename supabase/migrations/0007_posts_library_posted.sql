-- Posts library: track "đã đăng" (posted_at) separately from "đã tạo"
-- (created_at), and let owners delete their own posts.
alter table generated_posts add column if not exists posted_at timestamptz;
create index if not exists idx_posts_posted on generated_posts(user_id, posted_at) where posted_at is not null;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='generated_posts' and policyname='posts_delete') then
    create policy posts_delete on generated_posts for delete using (user_id = auth.uid());
  end if;
end $$;

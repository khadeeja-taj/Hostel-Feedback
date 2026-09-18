-- ============================================================================
-- IIUI Hostel Feedback — Supabase (PostgreSQL) schema
-- Run this in Supabase → SQL Editor → New query → paste → Run.
-- ============================================================================

-- Reference roster (optional, strengthens verification)
create table if not exists residents (
  student_id      text primary key,
  full_name       text not null,
  email           text,
  room_number     text,
  block           text,
  academic_level  text
);

-- One row per student response. 14 services → rating_1..14 + comment_1..14.
create table if not exists submissions (
  id             bigint generated always as identity primary key,
  student_id     text not null,
  full_name      text,
  email          text,
  room_number    text,
  block          text,
  academic_level text,
  is_resident    int default 1,
  rating_1  int, comment_1  text,
  rating_2  int, comment_2  text,
  rating_3  int, comment_3  text,
  rating_4  int, comment_4  text,
  rating_5  int, comment_5  text,
  rating_6  int, comment_6  text,
  rating_7  int, comment_7  text,
  rating_8  int, comment_8  text,
  rating_9  int, comment_9  text,
  rating_10 int, comment_10 text,
  rating_11 int, comment_11 text,
  rating_12 int, comment_12 text,
  rating_13 int, comment_13 text,
  rating_14 int, comment_14 text,
  main_issues          text,
  suggestions          text,
  additional_comments  text,
  created_at   timestamptz default now()
);

create index if not exists submissions_student_idx on submissions (lower(student_id));
create index if not exists submissions_block_idx   on submissions (block);
create index if not exists submissions_created_idx on submissions (created_at);

-- Row Level Security ON: the public (anon) key cannot read or write these
-- tables directly. All access goes through Netlify Functions using the
-- SERVICE ROLE key, which bypasses RLS. No anon policies are added on purpose.
alter table residents  enable row level security;
alter table submissions enable row level security;

-- ============================================================================
-- Migration: add the 15th service category (ARHT — Assistant Resident House Tutor)
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run on an existing database that already has data.
-- ============================================================================

alter table submissions
  add column if not exists rating_15  int,
  add column if not exists comment_15 text;

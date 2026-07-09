alter table "public"."quiz_submissions" add column "user_id" uuid references auth.users(id) on delete cascade;

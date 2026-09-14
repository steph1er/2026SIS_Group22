# Supabase Setup and Instructions

Schema changes are tracked as migrations in 'migrations/'.

## One time set-up (per person)

You only need to run the following two steps once for set-up, in project root:

1. Log into supabase and follow directions:

```bash
npx supabase login
```

2. Link repo to supabase project:

```bash
npx supabase link --project-ref kglybxcngrruskhuzqsz
```

kglybxcngrruskhuzqsz is our Project ID.

## Creating migrations and schema changes

1. To create a new migration:

```bash
npx supabase migration new <short-descript>
```

Use Case Examples:

- To create a new table: `npx supabase migration new create_outfits_table`

- To update a table: `npx supabase migration new update_profiles_table`

2. Edit the generated '.sql/' file in 'migrations/'
3. Apply it:

```bash
npx supabase db push
```

4. Commit the migration files!

## Important Reminders

1. Always ensure **Row Level Security** is enabled for every table! (`alter table <table-name> enable row level security;`)
2. Write policies so that only authenticated users can access their own data. E.g.

```SQL
create policy "Users can only access their own items"
on wardrobe_items for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

For more info, here are links to some Supabase official docs:

- https://supabase.com/docs/guides/deployment/database-migrations
- https://supabase.com/docs/guides/database/postgres/row-level-security

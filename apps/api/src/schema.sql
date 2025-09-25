create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  team text,
  role text,
  manager_id uuid references employees(id) on delete set null,
  org_role text default 'ic',
  profile_summary text,
  pay_band int,
  created_at timestamptz default now()
);

-- Ensure manager_id exists if employees table pre-existed without it
alter table employees add column if not exists manager_id uuid;
do $$ begin
  begin
    alter table employees
      add constraint employees_manager_fk foreign key (manager_id) references employees(id) on delete set null;
  exception when duplicate_object then null; end;
end $$;

create table if not exists topics (
  id bigserial primary key,
  name text unique not null
);

create table if not exists expertise_scores (
  employee_id uuid references employees(id) on delete cascade,
  topic_id bigint references topics(id) on delete cascade,
  score real not null,
  freshness_days int not null default 0,
  primary key(employee_id, topic_id)
);

create table if not exists docs (
  id uuid primary key,
  employee_id uuid references employees(id) on delete set null,
  title text not null,
  source_url text,
  visibility text default 'private',
  created_at timestamptz default now()
);

-- embedding vector dimension will be adjusted at runtime when empty
create table if not exists chunks (
  id uuid primary key,
  doc_id uuid references docs(id) on delete cascade,
  text_snippet text not null,
  embedding vector(256)
);

create table if not exists audit_log (
  id bigserial primary key,
  ts timestamptz not null default now(),
  actor text,
  action text,
  subject text,
  details jsonb
);

create index if not exists idx_expertise_employee on expertise_scores(employee_id);
create index if not exists idx_docs_employee on docs(employee_id);
create index if not exists idx_employees_manager on employees(manager_id);

-- Meetings schema
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  summary text,
  started_at timestamptz default now(),
  duration_minutes int,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists meeting_participants (
  meeting_id uuid references meetings(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  role text default 'participant',
  primary key(meeting_id, employee_id)
);

create table if not exists meeting_topics (
  meeting_id uuid references meetings(id) on delete cascade,
  topic_id bigint references topics(id) on delete cascade,
  confidence real,
  primary key(meeting_id, topic_id)
);

create index if not exists idx_meetings_created_by on meetings(created_by);
create index if not exists idx_meeting_participants_employee on meeting_participants(employee_id);
-- ivfflat requires analyze and suitable list size, use defaults for demo
do $$ begin
  begin
    create index idx_chunks_embedding on chunks using ivfflat (embedding vector_cosine_ops);
  exception when others then null; end;
end $$;



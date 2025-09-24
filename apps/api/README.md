Synapse API

Express + Postgres backend for expert finder and knowledge risk graph.

Setup

1) Environment

Create `.env` in this directory:

```
PORT=4000
DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
ANTHROPIC_API_KEY=
ANTHROPIC_EMBED_MODEL=claude-embed
EMBED_MOCK=1
RETENTION_DAYS=90
```

2) Install and run

```
bun install
# generate Prisma client
yarn prisma db push || bunx prisma db push
bunx prisma generate
bun run migrate
bun run seed
bun run dev
```

Endpoints

```
GET  /healthz
POST /api/ingest
POST /api/search
POST /api/friday
GET  /api/expertise?employeeId=...
GET  /api/graph?topic=...
GET  /api/privacy/export?employeeId=...
DELETE /api/privacy/delete?employeeId=...
```

Curl examples

```
curl -s localhost:4000/healthz

curl -s -X POST localhost:4000/api/search -H 'content-type: application/json' -d '{"query":"GKE staging deploy","topK":5}'
```

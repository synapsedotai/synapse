Synapse API

Express + Postgres backend for expert finder and knowledge risk graph.

Setup

1) Environment

Create `.env` in this directory:

```
PORT=4000
DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
OPENAI_API_KEY=...
OPENAI_EMBED_MODEL=text-embedding-3-small
ANTHROPIC_API_KEY=...
ANTHROPIC_TOPIC_MODEL=claude-3-5-sonnet-latest
EMBED_MOCK=0
EMBED_FALLBACK=0
RETENTION_DAYS=90
```

2) Install and run

```
bun install
bunx prisma db push
bunx prisma generate
bun run migrate
bun run seed
bun run dev
```

Health

```
GET /healthz
# Response
{ "ok": true, "embedModel": "text-embedding-3-small", "dim": 1536 }
```

APIs (contracts)

Ingest

```
POST /api/ingest
Content-Type: application/json
{
  "employeeId": "<uuid>",
  "title": "K8s Probes Guide",
  "text": "...",           // or omit text and provide a public url
  "url": "https://...",    // optional; text fetched if provided
  "visibility": "org"      // one of: private|team|org
}
# Response
{ "docId": "<uuid>", "chunkCount": 3 }
```

Search

```
POST /api/search
Content-Type: application/json
{
  "query": "Kubernetes probes in staging",
  "topK": 5
}
# Response
{
  "plan": ["kb.search", "experts.rank"],
  "snippets": [ { "text": "…≤200 chars…", "source": "K8s Probes Guide", "docId": "<uuid>" } ],
  "candidateTopics": [ { "name": "Kubernetes", "confidence": 0.83 } ],
  "experts": [ { "employeeId": "<uuid>", "name": "Alex Chen", "score": 0.91, "freshnessDays": 12 } ]
}
```

Friday (weekly interview)

Send either a `summary` (preferred) or a list of `answers`.

```
POST /api/friday
Content-Type: application/json
{
  "employeeId": "<uuid>",
  "summary": "Shipped Terraform IAM roles and CI hardening; tools: Terraform, GitHub Actions"
}
# or
{
  "employeeId": "<uuid>",
  "answers": [
    { "q": "What did you ship?", "a": "Terraform IAM roles and CI hardening" },
    { "q": "What stack/tools?", "a": "Terraform, GitHub Actions" }
  ]
}
# Response
{ "topicsUpdated": [ { "name": "Terraform", "score": 0.9 } ] }
```

Expertise (by employee)

```
GET /api/expertise?employeeId=<uuid>
# Response
[ { "name": "Terraform", "score": 0.9, "freshness_days": 0 }, ... ]
```

Profile (steckbrief)

```
GET /api/profile?employeeId=<uuid>
# Response
{
  "id": "<uuid>",
  "name": "Alex Chen",
  "email": "alex@example.com",
  "team": "Platform",
  "role": "SRE",
  "org_role": "manager",
  "profile_summary": "...",   // from Friday summary
  "topics": [ { "name": "Kubernetes", "score": 0.88, "freshness_days": 3 } ]
}
```

Graph

Org view (hierarchy):
```
GET /api/graph
# Response
{ "nodes": [ { "id": "<uuid>", "label": "Name", "role": "SRE" } ],
  "edges": [ { "source": "<managerId>", "target": "<reportId>" } ],
  "insights": { "type": "org" } }
```

Topic view (knowledge graph):
Global knowledge view (shared topics with IDF weighting):
```
GET /api/graph?mode=knowledge
# Response
{ "nodes": [ { "id": "<uuid>", "label": "Name", "score": 3.2 } ],
  "edges": [ { "source": "<uuidA>", "target": "<uuidB>", "weight": 0.75 } ],
  "insights": { "type": "knowledge" } }
```
```
GET /api/graph?topic=Kubernetes
# Response
{ "nodes": [ { "id": "<uuid>", "label": "Name", "score": 0.9 } ],
  "edges": [
    { "source": "<uuidA>", "target": "<uuidB>", "weight": 0.42,
      "sharedTopics": [ { "name": "Kubernetes", "scoreA": 0.9, "scoreB": 0.8 } ] }
  ],
  "insights": { "busFactor": 0.67 } }
```

Meetings (CRUD)

Create:
```
POST /api/meetings
Content-Type: application/json
{ "topic": "Kubernetes", "summary": "Probe tuning session" }
# Response
{ "id": "<uuid>", "topic": "Kubernetes", "summary": "...", ... }
```

Add participant:
```
POST /api/meetings/:id/participants
Content-Type: application/json
{ "employeeId": "<uuid>", "role": "participant" }
# Response
{ "meeting_id": "<uuid>", "employee_id": "<uuid>", "role": "participant" }
```

Tag topic on meeting:
```
POST /api/meetings/:id/topics
Content-Type: application/json
{ "topic": "Kubernetes", "confidence": 0.9 }
# Response
{ "meetingId": "<uuid>", "topicId": 123, "confidence": 0.9 }
```

List (optional filter by employee):
```
GET /api/meetings
GET /api/meetings?employeeId=<uuid>
```

Privacy

```
GET    /api/privacy/export?employeeId=<uuid>
DELETE /api/privacy/delete?employeeId=<uuid>
```

Notes for frontend
- Expect UUIDs for employees/docs/meetings.
- Topic names are normalized (e.g., "Kubernetes Probes" → "Kubernetes").
- Org graph nodes include `role` (title) and can be expanded to include `org_role` if needed.
- Search snippets are capped to ~200 chars; docs are not exposed in full by design.

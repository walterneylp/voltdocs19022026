# Architecture

Stack
- Backend: Node.js + Express + TypeScript
- DB: Supabase/Postgres (existing schema, RLS enforced)

Layers
1) Routes: HTTP route mapping
2) Controllers: request validation and response shaping
3) Repositories: data access via Supabase client
4) Models: TypeScript interfaces (schema mirror)
5) Infra: Supabase client + auth middleware

Folder Structure (backend)
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
    controllers/
    lib/
    middleware/
    models/
    repositories/
    routes/
    types/

Principles
- No migrations or schema changes.
- RLS respected; all requests must carry Supabase JWT.
- Tenant isolation via RLS and tenant_id on writes.

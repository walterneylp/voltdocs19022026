# APIs and Screens (proposal)

Screens
- Login: Supabase auth.
- Dashboard: KPIs from assets, documents, tickets, field_updates.
- Assets (Equipamentos): list/create/update, QR label.
- Sites (Locais): list/create/update.
- Documents: list/upload versions/link assets/filter by equipment.
- Tickets (Chamados): list/create/assign/close.
- Reports: compliance and audit logs.
- PIE/RTI: compliance checklist + evidence summary.
- Field Updates: list pending/processed and close with notes.
- Users: list profiles.
- Groups: list/create groups, manage members.

API Surface (HTTP + JSON)
- GET /api/health
- GET /api/assets
- POST /api/assets
- PATCH /api/assets/:id
- GET /api/sites
- POST /api/sites
- GET /api/documents
- POST /api/documents
- POST /api/documents/versions
- POST /api/documents/link
- GET /api/tickets
- POST /api/tickets
- PATCH /api/tickets/:id
- POST /api/tickets/groups
- GET /api/field-updates
- POST /api/field-updates
- PATCH /api/field-updates/:id
- GET /api/profiles
- GET /api/user-groups
- POST /api/user-groups
- POST /api/user-groups/members

Rules (initial)
- All routes require Authorization: Bearer <Supabase JWT> (RLS).
- Writes must include tenant_id when RLS policy checks auth.jwt().
- Documents can be linked via documents.equipment_id or document_equipments.
- Tickets can be assigned to user (assigned_to_id) or groups.

import { z } from "zod";
import { assignTicketGroup, createTicket, listTickets, updateTicket } from "../repositories/tickets-repo.js";
import { supabaseAdmin } from "../lib/supabase.js";
const ticketCreateSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    equipment_id: z.string().uuid(),
    opened_by_id: z.string().uuid().nullable().optional(),
    assigned_to_id: z.string().uuid().nullable().optional(),
    tenant_id: z.string().uuid(),
    assigned_group_ids: z.array(z.string().uuid()).nullable().optional()
});
const ticketUpdateSchema = ticketCreateSchema.partial().omit({ tenant_id: true });
const ticketGroupSchema = z.object({
    ticket_id: z.string().uuid(),
    group_id: z.string().uuid(),
    tenant_id: z.string().uuid()
});
export const getTickets = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const tickets = await listTickets(client);
    res.json({ data: tickets });
};
export const postTicket = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const payload = ticketCreateSchema.parse(req.body);
    const ticket = await createTicket(client, {
        ...payload,
        description: payload.description ?? null,
        status: payload.status ?? null,
        priority: payload.priority ?? null,
        opened_by_id: payload.opened_by_id ?? null,
        assigned_to_id: payload.assigned_to_id ?? null,
        assigned_group_ids: payload.assigned_group_ids ?? null
    });
    res.status(201).json({ data: ticket });
};
export const patchTicket = async (req, res) => {
    const client = req.supabase;
    if (!client)
        return res.status(500).json({ error: "Missing supabase client" });
    const ticketId = z.string().uuid().parse(req.params.id);
    const patch = ticketUpdateSchema.parse(req.body);
    const ticket = await updateTicket(client, ticketId, patch);
    res.json({ data: ticket });
};
export const postTicketGroupAssignment = async (req, res) => {
    if (!supabaseAdmin) {
        return res.status(500).json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
    }
    const payload = ticketGroupSchema.parse(req.body);
    const assignment = await assignTicketGroup(supabaseAdmin, payload);
    res.status(201).json({ data: assignment });
};

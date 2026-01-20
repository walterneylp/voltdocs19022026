export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  equipment_id: string;
  opened_by_id: string | null;
  assigned_to_id: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  assigned_group_ids: string[] | null;
}

export interface TicketGroupAssignment {
  ticket_id: string;
  group_id: string;
  tenant_id: string;
}

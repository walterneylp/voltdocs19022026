export interface FieldUpdate {
  id: string;
  base_path: string | null;
  message: string;
  code: string | null;
  user_id: string;
  user_name: string | null;
  tenant_id: string | null;
  attachments: string[] | null;
  audio_path: string | null;
  created_at: string;
  status: string | null;
  event_report: boolean | null;
  close_note: string | null;
  closed_at: string | null;
  closed_by_id: string | null;
  closed_by_name: string | null;
}

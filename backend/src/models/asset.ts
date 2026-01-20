export interface Asset {
  id: string;
  tag: string;
  name: string;
  description: string | null;
  patrimony_number: string | null;
  voltage: string | null;
  current_rating: number | null;
  atpv: number | null;
  risk_level: string | null;
  site_id: string | null;
  tenant_id: string;
  qr_code_uuid: string | null;
  updated_at: string;
}

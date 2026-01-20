export interface CompanyProfile {
  id: string;
  tenant_id: string;
  legal_name: string;
  trade_name: string | null;
  cnpj: string;
  state_registration: string | null;
  municipal_registration: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  created_at: string;
}

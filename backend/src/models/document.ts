export interface Document {
  id: string;
  title: string;
  category: string;
  category_id?: string | null;
  equipment_id: string | null;
  tenant_id: string;
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  file_path: string;
  file_name: string;
  valid_from: string | null;
  valid_until: string | null;
  content_type?: string | null;
  tenant_id: string;
  created_at: string;
}

export interface DocumentEquipment {
  id: string;
  document_id: string;
  equipment_id: string;
  tenant_id: string | null;
  created_at: string;
}

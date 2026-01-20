export interface Profile {
  id: string;
  name: string | null;
  role: string | null;
  tenant_id: string | null;
  created_at: string;
  email: string | null;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  tenant_id: string;
  created_at: string;
}

export interface UserGroupMember {
  user_id: string;
  group_id: string;
  tenant_id: string;
}

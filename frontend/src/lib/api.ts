const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";

const getToken = () => localStorage.getItem(ACCESS_KEY) ?? "";
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) ?? "";

export const setToken = (token: string) => {
  localStorage.setItem(ACCESS_KEY, token);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    clearToken();
    return null;
  }
  setToken(payload.data?.access_token ?? "");
  setRefreshToken(payload.data?.refresh_token ?? refreshToken);
  return payload.data?.access_token ?? null;
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  retry = true
) => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error ?? "Request failed";
    if (retry && (response.status === 401 || message.includes("JWT expired"))) {
      const newToken = await refreshSession();
      if (newToken) {
        return request<T>(path, options, false);
      }
    }
    throw new Error(message);
  }

  return payload.data as T;
};

const requestForm = async <T>(path: string, form: FormData, retry = true) => {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: form
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error ?? "Request failed";
    if (retry && (response.status === 401 || message.includes("JWT expired"))) {
      const newToken = await refreshSession();
      if (newToken) {
        return requestForm<T>(path, form, false);
      }
    }
    throw new Error(message);
  }
  return payload.data as T;
};

export const login = async (email: string, password: string) => {
  return request<{ access_token: string; refresh_token: string; user: unknown }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password })
    }
  );
};

export const getMe = async () => {
  return request<{
    user: unknown;
    profile: { id: string; tenant_id: string | null; name?: string | null; email?: string | null };
  }>("/auth/me");
};

export const listProfiles = async () => {
  return request<
    Array<{ id: string; name: string | null; email: string | null; role: string | null }>
  >("/profiles");
};

export const listUsers = async () => {
  return request<
    Array<{
      id: string;
      email: string | null;
      name: string | null;
      role: string | null;
      tenant_id: string;
      blocked: boolean;
      deleted: boolean;
      blocked_reason: string | null;
      deleted_reason: string | null;
    }>
  >("/users");
};

export const listUserGroups = async () => {
  return request<Array<{ id: string; name: string; description: string | null }>>("/user-groups");
};

export const updateUserGroup = async (
  id: string,
  payload: { description: string | null }
) => {
  return request<{ id: string }>(`/user-groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const listUserGroupMembers = async () => {
  return request<
    Array<{
      user_id: string;
      group_id: string;
      tenant_id: string;
    }>
  >("/user-groups/members");
};

export const addUserGroupMember = async (payload: {
  user_id: string;
  group_id: string;
  tenant_id: string;
}) => {
  return request<{ id: string }>("/user-groups/members", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const removeUserGroupMember = async (payload: {
  user_id: string;
  group_id: string;
}) => {
  return request<void>("/user-groups/members", {
    method: "DELETE",
    body: JSON.stringify(payload)
  });
};

export const listTickets = async () => {
  return request<
    Array<{
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
    }>
  >("/tickets");
};

export const listFieldUpdates = async () => {
  return request<
    Array<{
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
    }>
  >("/field-updates");
};

export const postFieldUpdate = async (payload: {
  base_path?: string | null;
  message: string;
  code?: string | null;
  user_id: string;
  user_name?: string | null;
  tenant_id?: string | null;
  attachments?: string[] | null;
  audio_path?: string | null;
  status?: string | null;
  event_report?: boolean;
}) => {
  return request<{ id: string }>("/field-updates", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const getFieldUpdateFileUrl = async (path: string) => {
  return request<{ url: string }>("/field-updates/file-url", {
    method: "POST",
    body: JSON.stringify({ path })
  });
};

export const uploadFieldUpdateFiles = async (payload: {
  tenant_id: string;
  user_id: string;
  files: File[];
}) => {
  const form = new FormData();
  form.append("tenant_id", payload.tenant_id);
  form.append("user_id", payload.user_id);
  payload.files.forEach((file) => form.append("files", file));
  return requestForm<string[]>("/field-updates/upload", form);
};

export const createTicket = async (payload: {
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  equipment_id: string;
  opened_by_id?: string | null;
  assigned_to_id?: string | null;
  tenant_id: string;
  assigned_group_ids?: string[] | null;
}) => {
  return request<{ id: string }>("/tickets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateTicket = async (
  id: string,
  payload: {
    title?: string;
    description?: string | null;
    status?: string | null;
    priority?: string | null;
    equipment_id?: string;
    opened_by_id?: string | null;
    assigned_to_id?: string | null;
    assigned_group_ids?: string[] | null;
  }
) => {
  return request<{ id: string }>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const assignTicketGroup = async (payload: {
  ticket_id: string;
  group_id: string;
  tenant_id: string;
}) => {
  return request<{ ticket_id: string; group_id: string }>("/tickets/groups", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const listSites = async () => {
  return request<Array<{ id: string; name: string; address: string | null }>>("/sites");
};

export const createSite = async (payload: {
  name: string;
  address?: string | null;
  tenant_id: string;
}) => {
  return request<{ id: string }>("/sites", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateSite = async (
  id: string,
  payload: { name?: string; address?: string | null }
) => {
  return request<{ id: string }>(`/sites/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteSite = async (id: string) => {
  return request<{ id: string }>(`/sites/${id}`, {
    method: "DELETE"
  });
};

export const listDocumentCategories = async () => {
  return request<Array<{ id: string; code: string; name: string }>>(
    "/document-categories"
  );
};

export const createDocumentCategory = async (payload: {
  code: string;
  name: string;
  tenant_id: string;
}) => {
  return request<{ id: string }>("/document-categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateDocumentCategory = async (
  id: string,
  payload: {
    code: string;
    name: string;
  }
) => {
  return request<{ id: string }>(`/document-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteDocumentCategory = async (id: string) => {
  return request<void>(`/document-categories/${id}`, {
    method: "DELETE"
  });
};

export const createDocument = async (payload: {
  title: string;
  category?: string;
  category_id?: string | null;
  equipment_id?: string | null;
  tenant_id: string;
}) => {
  return request<{ id: string }>("/documents", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateDocument = async (
  id: string,
  payload: {
    title?: string;
    category?: string;
    category_id?: string | null;
  }
) => {
  return request<{ id: string }>(`/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteDocument = async (id: string) => {
  return request<void>(`/documents/${id}`, {
    method: "DELETE"
  });
};

export const listDocuments = async () => {
  return request<
    Array<{
      id: string;
      title: string;
      category: string;
      category_id?: string | null;
      equipment_id?: string | null;
      tenant_id: string;
      created_at: string;
    }>
  >("/documents");
};

export const listDocumentEquipments = async () => {
  return request<
    Array<{
      id: string;
      document_id: string;
      equipment_id: string;
      tenant_id: string | null;
      created_at: string;
    }>
  >("/document-equipments");
};

export const listDocumentVersions = async () => {
  return request<
    Array<{
      id: string;
      document_id: string;
      version: string;
      file_path: string;
      file_name: string;
      valid_from: string | null;
      valid_until: string | null;
      tenant_id: string;
      created_at: string;
    }>
  >("/document-versions");
};

export const getDocumentVersionUrl = async (id: string) => {
  return request<{ url: string }>(`/document-versions/${id}/url`);
};

export const deleteDocumentVersion = async (id: string) => {
  return request<void>(`/document-versions/${id}`, {
    method: "DELETE"
  });
};

export const linkDocumentEquipment = async (payload: {
  document_id: string;
  equipment_id: string;
  tenant_id?: string | null;
}) => {
  return request<{ id: string }>("/documents/link", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const unlinkDocumentEquipment = async (payload: {
  document_id: string;
  equipment_ids: string[];
}) => {
  return request<void>("/documents/link", {
    method: "DELETE",
    body: JSON.stringify(payload)
  });
};

export const uploadDocumentFile = async (payload: {
  document_id: string;
  tenant_id: string;
  version: string;
  valid_from?: string | null;
  valid_until?: string | null;
  file: File;
}) => {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("document_id", payload.document_id);
  form.append("tenant_id", payload.tenant_id);
  form.append("version", payload.version);
  if (payload.valid_from) form.append("valid_from", payload.valid_from);
  if (payload.valid_until) form.append("valid_until", payload.valid_until);

  return requestForm<{ id: string }>("/documents/upload", form);
};

export const listAssets = async () => {
  return request<
    Array<{
      id: string;
      tag: string;
      name: string;
      patrimony_number: string | null;
      voltage: string | null;
      current_rating: number | null;
      atpv: number | null;
      risk_level: string | null;
      site_id: string | null;
    }>
  >("/assets");
};

export const createAsset = async (payload: {
  tag: string;
  name: string;
  description?: string | null;
  patrimony_number?: string | null;
  voltage?: string | null;
  current_rating?: number | null;
  atpv?: number | null;
  risk_level?: string | null;
  site_id?: string | null;
  tenant_id: string;
}) => {
  return request<{ id: string }>("/assets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateAsset = async (
  id: string,
  payload: {
    tag?: string;
    name?: string;
    description?: string | null;
    patrimony_number?: string | null;
    voltage?: string | null;
    current_rating?: number | null;
    atpv?: number | null;
    risk_level?: string | null;
    site_id?: string | null;
  }
) => {
  return request<{ id: string }>(`/assets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteAsset = async (id: string) => {
  return request<{ id: string }>(`/assets/${id}`, {
    method: "DELETE"
  });
};

export const listCompanyProfiles = async () => {
  return request<
    Array<{
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
    }>
  >("/company-profiles");
};

export const createCompanyProfile = async (payload: {
  tenant_id: string;
  legal_name: string;
  trade_name?: string | null;
  cnpj: string;
  state_registration?: string | null;
  municipal_registration?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_district?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}) => {
  return request<{ id: string }>("/company-profiles", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateCompanyProfile = async (
  id: string,
  payload: {
    legal_name?: string;
    trade_name?: string | null;
    cnpj?: string;
    state_registration?: string | null;
    municipal_registration?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address_street?: string | null;
    address_number?: string | null;
    address_complement?: string | null;
    address_district?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_zip?: string | null;
  }
) => {
  return request<{ id: string }>(`/company-profiles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteCompanyProfile = async (id: string) => {
  return request<void>(`/company-profiles/${id}`, {
    method: "DELETE"
  });
};

export const getAuditPasta1Config = async () => {
  return request<{
    meta: { config_hash: string; config_version: string | null; engine: string | null } | null;
    items: Array<{
      item_id: string;
      pasta: string;
      categoria: string;
      nome: string;
      requisitos_minimos: string[];
      campos_obrigatorios: string[];
      evidencias_esperadas: string[];
      palavras_chave: string[];
    }>;
  }>("/audit/pasta1/config");
};

export const runAuditPasta1 = async () => {
  return request<{
    run_id: string;
    results: Array<{
      item_id: string;
      status: string;
      score_percentual: number;
      itens_atendidos: string[];
      itens_faltantes: string[];
      recomendacoes: string[];
      trechos_evidencia: string[];
    }>;
  }>("/audit/pasta1/run", { method: "POST" });
};

export const getAuditPasta1Results = async () => {
  return request<{
    run: { id: string } | null;
    results: Array<{
      item_id: string;
      status: string;
      score_percentual: number;
      itens_atendidos: string[];
      itens_faltantes: string[];
      recomendacoes: string[];
      trechos_evidencia: string[];
    }>;
  }>("/audit/pasta1/results");
};

export const listAuditPasta1Evidences = async (itemId: string) => {
  return request<
    Array<{
      id: string;
      item_id: string;
      document_id: string;
      tipo_evidencia: string | null;
      observacao: string | null;
      documents?: { id: string; title: string; category: string } | null;
    }>
  >(`/audit/pasta1/evidences?item_id=${encodeURIComponent(itemId)}`);
};

export const addAuditPasta1Evidence = async (payload: {
  item_id: string;
  document_id: string;
  tipo_evidencia: string;
  observacao?: string | null;
}) => {
  return request<{ id: string }>("/audit/pasta1/evidences", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const deleteAuditPasta1Evidence = async (id: string) => {
  return request<void>(`/audit/pasta1/evidences?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
};

export const indexAuditPasta1Documents = async () => {
  return request<{ indexed: number }>("/audit/pasta1/index", {
    method: "POST"
  });
};

export const createUser = async (payload: {
  email: string;
  password: string;
  name: string;
  role: string;
  tenant_id: string;
  group_ids?: string[];
}) => {
  return request<{ id: string }>("/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const updateUser = async (
  id: string,
  payload: {
    name: string;
    role: string;
  }
) => {
  return request<{ id: string }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
};

export const deleteUser = async (id: string, reason: string) => {
  return request<void>(`/users/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ reason })
  });
};

export const blockUser = async (id: string, reason: string) => {
  return request<{ id: string }>(`/users/${id}/block`, {
    method: "POST",
    body: JSON.stringify({ reason })
  });
};

export const updatePassword = async (password: string) => {
  return request<unknown>("/auth/password", {
    method: "POST",
    body: JSON.stringify({ password })
  });
};

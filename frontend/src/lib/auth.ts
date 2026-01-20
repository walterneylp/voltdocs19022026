const STORAGE_KEY = "auth_user";

type AuthUser = {
  name: string;
  email: string;
};

export const setAuthUser = (user: AuthUser) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const clearAuthUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

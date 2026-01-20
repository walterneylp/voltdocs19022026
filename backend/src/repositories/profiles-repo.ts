import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, UserGroup, UserGroupMember } from "../models/profile.js";

export const listProfiles = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
};

export const listUserGroups = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("user_groups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as UserGroup[];
};

export const createUserGroup = async (
  client: SupabaseClient,
  payload: Omit<UserGroup, "id" | "created_at">
) => {
  const { data, error } = await client
    .from("user_groups")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserGroup;
};

export const updateUserGroup = async (
  client: SupabaseClient,
  id: string,
  payload: Pick<UserGroup, "description">
) => {
  const { data, error } = await client
    .from("user_groups")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserGroup;
};

export const addUserGroupMember = async (
  client: SupabaseClient,
  payload: UserGroupMember
) => {
  const { data, error } = await client
    .from("user_group_members")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserGroupMember;
};

export const listUserGroupMembers = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("user_group_members")
    .select("*")
    .order("user_id", { ascending: true });
  if (error) throw error;
  return data as UserGroupMember[];
};

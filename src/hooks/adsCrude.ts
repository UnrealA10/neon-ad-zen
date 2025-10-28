import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Id = string;

const qKeys = {
  accounts: ["ad_accounts"] as const,
  campaigns: ["campaigns"] as const,
  team: ["team_members"] as const,
};

function handleError(error: any) {
  if (error) throw new Error(error.message || "Operation failed");
}

/* ----------------- Ad Accounts ----------------- */
export const useAdAccounts = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qKeys.accounts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      handleError(error);
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .insert(payload)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.accounts }),
  });

  const update = useMutation({
    mutationFn: async (payload: { id: Id } & any) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("ad_accounts")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.accounts }),
  });

  const remove = useMutation({
    mutationFn: async (id: Id) => {
      const { error } = await supabase
        .from("ad_accounts")
        .delete()
        .eq("id", id);
      handleError(error);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.accounts }),
  });

  return { list, create, update, remove };
};

/* ----------------- Campaigns ----------------- */
export const useCampaigns = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qKeys.campaigns,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      handleError(error);
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert(payload)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.campaigns }),
  });

  const update = useMutation({
    mutationFn: async (payload: { id: Id } & any) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("campaigns")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.campaigns }),
  });

  const remove = useMutation({
    mutationFn: async (id: Id) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      handleError(error);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.campaigns }),
  });

  return { list, create, update, remove };
};

/* ----------------- Team Members ----------------- */
export const useTeam = () => {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qKeys.team,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });
      handleError(error);
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from("team_members")
        .insert(payload)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.team }),
  });

  const update = useMutation({
    mutationFn: async (payload: { id: Id } & any) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("team_members")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      handleError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.team }),
  });

  const remove = useMutation({
    mutationFn: async (id: Id) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      handleError(error);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKeys.team }),
  });

  return { list, create, update, remove };
};

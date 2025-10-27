import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdAccount, Campaign, TeamMember } from "@/types/ads";

const qk = {
  accounts: ["ad_accounts"],
  campaigns: ["campaigns"],
  team: ["team_members"],
};

export function useAdAccounts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qk.accounts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdAccount[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<AdAccount>) => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("ad_accounts")
        .insert({ ...payload, created_by: uid })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts }),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...rest
    }: Partial<AdAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ad_accounts")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts }),
  });

  return { list, create, update, remove };
}

export function useCampaigns() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qk.campaigns,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<Campaign>) => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("campaigns")
        .insert({ ...payload, created_by: uid })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.campaigns }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.campaigns }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.campaigns }),
  });

  return { list, create, update, remove };
}

export function useTeam() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: qk.team,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<TeamMember>) => {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from("team_members")
        .insert({ ...payload, created_by: uid })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.team }),
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      ...rest
    }: Partial<TeamMember> & { id: string }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.team }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.team }),
  });

  return { list, create, update, remove };
}

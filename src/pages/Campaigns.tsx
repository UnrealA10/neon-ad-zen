// src/pages/Campaigns.tsx
import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@headlessui/react";
import { toast } from "sonner";
import { ChevronDown, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";

/* ------------------------------------------------
   TABLE NAMES
------------------------------------------------ */
const CMP_TABLE = "campaigns_v2" as const;
const ACC_TABLE = "ad_accounts_v2" as const;
const TEAM_TABLE = "team" as const; // your existing team table

/* ------------------------------------------------
   TYPES
------------------------------------------------ */
type CampaignRow = {
  id: string;
  portfolio_name: string | null;
  account_id: string | null;
  account_name: string | null;
  campaign_name: string;
  name: string; // generated = campaign_name
  manager_name: string | null;
  objective: string | null;
  status: "draft" | "active" | "paused" | "completed";
  start_date: string | null; // date
  end_date: string | null; // date
  daily_budget: number | null;
  weekly_budget: number | null;
  favorite: boolean | null;
  created_by: string;
  created_at: string;
};

type AccountRow = {
  id: string;
  name: string;
  portfolio_name: string | null;
};

type TeamRow = {
  id: string;
  full_name: string | null;
};

type FormState = {
  portfolio_name: string;
  account_id: string;
  account_text: string;
  campaign_name: string;
  manager_name: string;
  objective: string;
  status: "draft" | "active" | "paused" | "completed";
  start_date: string;
  end_date: string;
  daily_budget: number;
  weekly_budget: number;
  notes?: string; // optional UI only
  favorite: boolean;
};

const emptyForm: FormState = {
  portfolio_name: "",
  account_id: "",
  account_text: "",
  campaign_name: "",
  manager_name: "",
  objective: "",
  status: "draft",
  start_date: "",
  end_date: "",
  daily_budget: 0,
  weekly_budget: 0,
  favorite: false,
};

/* ------------------------------------------------
   DATA HOOKS (React Query + Supabase)
------------------------------------------------ */
function useAccounts() {
  return useQuery({
    queryKey: [ACC_TABLE, "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(ACC_TABLE)
        .select("id,name,portfolio_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AccountRow[];
    },
  });
}

function useTeamLite() {
  return useQuery({
    queryKey: [TEAM_TABLE, "list-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TEAM_TABLE)
        .select("id,full_name")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamRow[];
    },
  });
}

function useCampaignsV2() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [CMP_TABLE, "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(CMP_TABLE)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CampaignRow[];
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<CampaignRow>) => {
      const { error } = await supabase.from(CMP_TABLE).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CMP_TABLE, "list"] }),
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string } & Partial<CampaignRow>) => {
      const { id, ...rest } = payload;
      const { error } = await supabase.from(CMP_TABLE).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CMP_TABLE, "list"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(CMP_TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CMP_TABLE, "list"] }),
  });

  return { list, create, update, remove };
}

/* ------------------------------------------------
   PAGE
------------------------------------------------ */
export default function Campaigns() {
  const accounts = useAccounts();
  const team = useTeamLite();
  const { list, create, update, remove } = useCampaignsV2();
  const [adAccountsSource, setAdAccountsSource] = useState<AccountRow[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isSaving = create.isLoading || update.isLoading;

  const accountMap = useMemo(() => {
    const m: Record<string, string> = {};
    const combined = [ ...(adAccountsSource ?? []), ...(accounts.data ?? []) ];
    combined.forEach((a) => (m[a.id] = a.name));
    return m;
  }, [accounts.data, adAccountsSource]);

  const combinedAccounts = useMemo(() => {
    return [ ...(adAccountsSource ?? []), ...(accounts.data ?? []) ];
  }, [adAccountsSource, accounts.data]);

  const portfolioOptions = useMemo(() => {
    const set = new Set<string>();
    const combined = [ ...(adAccountsSource ?? []), ...(accounts.data ?? []) ];
    combined.forEach((a) => a.portfolio_name && set.add(a.portfolio_name));
    return Array.from(set);
  }, [accounts.data, adAccountsSource]);


  const campaignNameOptions = useMemo(() => {
    const rows = (list.data ?? []) as CampaignRow[];
    const names = rows.map((c) => c.campaign_name).filter(Boolean);
    return Array.from(new Set(names));
  }, [list.data]);

  // Fetch ad_accounts table (primary source for existing portfolio/account names)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("ad_accounts")
          .select("id,name,portfolio_name")
          .order("created_at", { ascending: false });
        if (error) {
          // fallback quietly to existing accounts hook
          return;
        }
        if (!mounted) return;
        setAdAccountsSource((data ?? []) as AccountRow[]);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const managerOptions = useMemo(() => {
    return (team.data ?? [])
      .map((t) => t.full_name)
      .filter(Boolean) as string[];
  }, [team.data]);

  const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.campaign_name?.trim()) return toast.error("Campaign name is required");

    // resolve account by account_text within selected portfolio
    const pool = (accounts.data ?? []).filter((a) =>
      form.portfolio_name ? a.portfolio_name === form.portfolio_name : true
    );
    const matched = pool.find((a) => a.name === form.account_text);
    const account_id = matched?.id ?? null;
    const account_name = form.account_text || null;

    const payload: Partial<CampaignRow> = {
      portfolio_name: form.portfolio_name || null,
      account_id,
      account_name,
      campaign_name: form.campaign_name.trim(),
      manager_name: form.manager_name || null,
      objective: form.objective?.trim() || null,
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      daily_budget: num(form.daily_budget),
      weekly_budget: num(form.weekly_budget),
      favorite: !!form.favorite,
    };

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...payload });
        toast.success("Campaign updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Campaign created");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Error");
    }
  };

  const startEdit = (row: CampaignRow) => {
    setForm({
      portfolio_name: row.portfolio_name ?? "",
      account_id: row.account_id ?? "",
      account_text: row.account_id ? accountMap[row.account_id] ?? "" : (row.account_name ?? ""),
      campaign_name: row.campaign_name ?? row.name ?? "",
      manager_name: row.manager_name ?? "",
      objective: row.objective ?? "",
      status: row.status,
      start_date: row.start_date ?? "",
      end_date: row.end_date ?? "",
      daily_budget: Number(row.daily_budget ?? 0),
      weekly_budget: Number(row.weekly_budget ?? 0),
      favorite: !!row.favorite,
    });
    setEditingId(row.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  // If the URL contains ?campaignId=..., scroll to that campaign row and open edit
  const location = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const targetId = params.get("campaignId");
      if (!targetId) return;
      // wait for the DOM to render the list
      setTimeout(() => {
        const el = document.getElementById(`campaign-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // temporary highlight
          el.classList.add("ring-2", "ring-accent");
          setTimeout(() => el.classList.remove("ring-2", "ring-accent"), 2500);
        }

        // also open edit mode for convenience if the campaign exists
        const row = (list.data ?? []).find((r: any) => r.id === targetId);
        if (row) startEdit(row as CampaignRow);
      }, 120);
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, list.data]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Manually add and monitor your campaigns.</p>
        </div>

        {/* Form */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Campaign" : "Add New Campaign"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Portfolio */}
              <div className="space-y-2">
                <Label>Portfolio</Label>
                <Combobox
                  value={form.portfolio_name}
                  onChange={(val: string) =>
                    setForm((f) => ({ ...f, portfolio_name: val, account_text: "", account_id: "" }))
                  }
                >
                  <div className="relative">
                    <Combobox.Input
                      as={Input}
                      className="w-full"
                      displayValue={(v: any) => v}
                      onChange={(e: any) => setForm((f) => ({ ...f, portfolio_name: e.target.value }))}
                      placeholder="Select portfolio"
                    />
                    <Combobox.Button className="absolute right-2 top-1/2 -translate-y-1/2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card/90 p-1 shadow-lg ring-1 ring-border">
                      {portfolioOptions.length ? (
                        portfolioOptions.map((p) => (
                          <Combobox.Option
                            key={p}
                            value={p}
                            className={({ active }) =>
                              `cursor-pointer select-none rounded-md px-3 py-2 ${active ? "bg-border/20" : ""}`
                            }
                          >
                            {p}
                          </Combobox.Option>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No portfolios</div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <Label>Account</Label>
                <Combobox
                  value={form.account_text}
                  onChange={(val: string) => {
                    const combined = [ ...(adAccountsSource ?? []), ...(accounts.data ?? []) ];
                    const filtered = combined.filter((a) => (form.portfolio_name ? a.portfolio_name === form.portfolio_name : true));
                    const matched = filtered.find((a) => a.name === val);
                    setForm((f) => ({ ...f, account_text: val, account_id: matched ? matched.id : "" }));
                  }}
                >
                  <div className="relative">
                    <Combobox.Input
                      as={Input}
                      className="w-full"
                      displayValue={(v: any) => v}
                      onChange={(e: any) => setForm((f) => ({ ...f, account_text: e.target.value }))}
                      placeholder="Select account"
                    />
                    <Combobox.Button className="absolute right-2 top-1/2 -translate-y-1/2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Combobox.Button>

                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card/90 p-1 shadow-lg ring-1 ring-border">
                      {combinedAccounts
                        .filter((a) => (form.portfolio_name ? a.portfolio_name === form.portfolio_name : true))
                        .map((a) => (
                          <Combobox.Option
                            key={`${a.id}-${a.name}`}
                            value={a.name}
                            className={({ active }) =>
                              `cursor-pointer select-none rounded-md px-3 py-2 ${active ? "bg-border/20" : ""}`
                            }
                          >
                            {a.name}
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {/* Campaign Name */}
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Combobox
                  value={form.campaign_name}
                  onChange={(val: string) => setForm((f) => ({ ...f, campaign_name: val }))}
                >
                  <div className="relative">
                    <Combobox.Input
                      as={Input}
                      className="w-full"
                      displayValue={(v: any) => v}
                      onChange={(e: any) => setForm((f) => ({ ...f, campaign_name: e.target.value }))}
                      placeholder="Select or type campaign"
                    />
                    <Combobox.Button className="absolute right-2 top-1/2 -translate-y-1/2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Combobox.Button>
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-card/90 p-1 shadow-lg ring-1 ring-border">
                      {campaignNameOptions.length ? (
                        campaignNameOptions.map((c) => (
                          <Combobox.Option
                            key={c}
                            value={c}
                            className={({ active }) =>
                              `cursor-pointer select-none rounded-md px-3 py-2 ${active ? "bg-border/20" : ""}`
                            }
                          >
                            {c}
                          </Combobox.Option>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No campaigns</div>
                      )}
                    </Combobox.Options>
                  </div>
                </Combobox>
              </div>

              {/* Manager */}
              <div className="space-y-2">
                <Label>Manager</Label>
                <Input
                  list="managers-list"
                  value={form.manager_name}
                  onChange={(e) => setForm((f) => ({ ...f, manager_name: e.target.value }))}
                  placeholder="Select manager"
                />
                <datalist id="managers-list">
                  {managerOptions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              {/* Objective */}
              <div className="space-y-2">
                <Label>Objective</Label>
                <Input
                  value={form.objective}
                  onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                  placeholder="Leads / Sales / Awareness..."
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as FormState["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date || ""}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date || ""}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>

              {/* Budgets */}
              <div className="space-y-2">
                <Label>Daily Budget</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.daily_budget}
                  onChange={(e) => setForm((f) => ({ ...f, daily_budget: num(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weekly Budget</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.weekly_budget}
                  onChange={(e) => setForm((f) => ({ ...f, weekly_budget: num(e.target.value) }))}
                />
              </div>

              {/* Notes (optional UI only) */}
              <div className="md:col-span-3 space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Internal notes (UI only)"
                  value={(form as any).notes ?? ""}
                  onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="md:col-span-3">
                <Separator className="my-2" />
              </div>

              {/* Favorite toggle */}
              <div className="space-y-2">
                <Label>Favorite</Label>
                <div>
                  <Button
                    type="button"
                    variant={form.favorite ? "secondary" : "ghost"}
                    onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {form.favorite ? "Favorited" : "Mark Favorite"}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> {editingId ? "Update" : "Create"}
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Campaigns List</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {list.isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : list.data && list.data.length ? (
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 pr-4">Name</th>
                    <th className="text-left py-3 pr-4">Account</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Daily Budget</th>
                    <th className="text-left py-3 pr-4">Weekly Budget</th>
                    <th className="text-left py-3 pr-4">Fav</th>
                    <th className="text-left py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((c) => (
                    <tr id={`campaign-${c.id}`} key={c.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">{c.campaign_name || c.name}</td>
                      <td className="py-3 pr-4">{c.account_id ? accountMap[c.account_id] || "-" : (c.account_name || "-")}</td>
                      <td className="py-3 pr-4 capitalize">{c.status}</td>
                      <td className="py-3 pr-4">₹{Number(c.daily_budget ?? 0).toLocaleString()}</td>
                      <td className="py-3 pr-4">₹{Number(c.weekly_budget ?? 0).toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await update.mutateAsync({ id: c.id, favorite: !c.favorite });
                              toast.success(!c.favorite ? "Marked favorite" : "Removed favorite");
                            } catch (err: any) {
                              toast.error(err?.message || "Error");
                            }
                          }}
                        >
                          <Star className={`h-4 w-4 ${c.favorite ? "text-yellow-400" : "text-muted-foreground"}`} />
                        </Button>
                      </td>
                      <td className="py-3 pr-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await remove.mutateAsync(c.id);
                              toast.success("Campaign deleted");
                              if (editingId === c.id) cancelEdit();
                            } catch (err: any) {
                              toast.error(err?.message || "Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No campaigns yet. Add your first campaign above.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


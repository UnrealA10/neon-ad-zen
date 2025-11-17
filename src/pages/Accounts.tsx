import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

/* ---------------------------------- */
/*            TYPES & CONST           */
/* ---------------------------------- */
const TABLE = "ad_accounts_v2" as const;

type DBRow = {
  id: string;
  portfolio_name: string | null;
  name: string;
  campaign_name: string | null;
  manager_name: string | null;
  account_external_id: string | null;
  status: "active" | "paused" | "disabled" | "pending";
  currency: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
};

type FormState = {
  portfolio_name: string;
  name: string;
  manager_name: string;
  account_external_id: string;
  status: "active" | "paused" | "disabled" | "pending";
  currency: string;
  notes: string;
};

const emptyForm: FormState = {
  portfolio_name: "",
  name: "",
  manager_name: "",
  account_external_id: "",
  status: "active",
  currency: "INR",
  notes: "",
};

/* ---------------------------------- */
/*        DATA ACCESS (RQ CRUD)       */
/* ---------------------------------- */
function useAdAccountsV2() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [TABLE, "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DBRow[];
    },
  });

  const create = useMutation({
    mutationFn: async (
      payload: Omit<FormState, "status" | "currency"> &
        Pick<FormState, "status" | "currency">
    ) => {
      const { error } = await supabase.from(TABLE).insert({
        ...payload,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TABLE, "list"] }),
  });

  const update = useMutation({
    mutationFn: async (payload: { id: string } & Partial<FormState>) => {
      const { id, ...rest } = payload;
      const { error } = await supabase.from(TABLE).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TABLE, "list"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TABLE, "list"] }),
  });

  return { list, create, update, remove };
}

/* ---------------------------------- */
/*            PAGE COMPONENT          */
/* ---------------------------------- */
const Accounts = () => {
  const { list, create, update, remove } = useAdAccountsV2();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isSaving = create.isLoading || update.isLoading;
  const isLoadingTable = list.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Account name is required.");
      return;
    }

    const payload: FormState = {
      ...form,
      currency: form.currency?.trim() || "INR",
    };

    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...payload });
        toast.success("Account updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Account created");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save account");
    }
  };

  const startEdit = (row: DBRow) => {
    setForm({
      portfolio_name: row.portfolio_name ?? "",
      name: row.name ?? "",
      manager_name: row.manager_name ?? "",
      account_external_id: row.account_external_id ?? "",
      status: (row.status as FormState["status"]) ?? "active",
      currency: row.currency ?? "INR",
      notes: row.notes ?? "",
    });
    setEditingId(row.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ad Accounts</h1>
          <p className="text-muted-foreground">
            Manage your Meta advertising accounts.
          </p>
        </div>

        {/* Form */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {editingId ? "Edit Account" : "Add New Account"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create or update ad accounts — add basic details and notes.
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Portfolio Name</Label>
                  <Input
                    placeholder="Portfolio name / grouping"
                    value={form.portfolio_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, portfolio_name: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional portfolio or client grouping.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    placeholder="Client Name - Primary Account"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Friendly name to identify this account.
                  </p>
                </div>

                {/* Campaign Name removed per request */}
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Meta Account ID</Label>
                  <Input
                    placeholder="act_1234567890"
                    value={form.account_external_id}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        account_external_id: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Manager Name</Label>
                  <Input
                    placeholder="Account manager"
                    value={form.manager_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, manager_name: e.target.value }))
                    }
                  />
                </div>

                {/* placeholder column to keep grid balanced */}
                <div />
              </div>

              <Separator />

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        status: v as FormState["status"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={form.currency}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currency: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Billing owner, card last 4, special limits…"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:opacity-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Update
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

        {/* Table */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Accounts List</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoadingTable ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading…
              </div>
            ) : list.data && list.data.length ? (
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 pr-4">Name</th>
                    <th className="text-left py-3 pr-4">Portfolio</th>
                    <th className="text-left py-3 pr-4">Manager</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Currency</th>
                    <th className="text-left py-3 pr-4">Account ID</th>
                    <th className="text-left py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((acc) => (
                    <tr
                      key={acc.id}
                      className="border-b border-border/30 hover:bg-border/10 transition-colors"
                    >
                      <td className="py-3 pr-4">{acc.name}</td>
                      <td className="py-3 pr-4">{acc.portfolio_name || "—"}</td>
                      <td className="py-3 pr-4">{acc.manager_name || "—"}</td>
                      <td className="py-3 pr-4 capitalize">{acc.status}</td>
                      <td className="py-3 pr-4">{acc.currency}</td>
                      <td className="py-3 pr-4">
                        {acc.account_external_id || "—"}
                      </td>
                      <td className="py-3 pr-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(acc)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await remove.mutateAsync(acc.id);
                              toast.success("Account deleted");
                              if (editingId === acc.id) cancelEdit();
                            } catch (e: any) {
                              toast.error(e?.message || "Delete failed");
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No accounts yet. Add your first account above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
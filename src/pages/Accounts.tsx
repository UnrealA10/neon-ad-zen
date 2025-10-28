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
import { useState } from "react";
import { useAdAccounts } from "@/hooks/adsCrude";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, BadgeIndianRupee } from "lucide-react";

type FormState = {
  name: string;
  platform:
    | "facebook"
    | "instagram"
    | "messenger"
    | "whatsapp"
    | "audience_network";
  account_external_id: string;
  status: "active" | "paused" | "disabled" | "pending";
  monthly_budget: number;
  currency: string;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  platform: "facebook",
  account_external_id: "",
  status: "active",
  monthly_budget: 0,
  currency: "INR",
  notes: "",
};

const Accounts = () => {
  const { list, create, update, remove } = useAdAccounts();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isSaving = create.isLoading || update.isLoading;
  const isLoadingTable = list.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Account name is required.");
    if ((form.monthly_budget ?? 0) < 0)
      return toast.error("Monthly budget cannot be negative.");

    const payload = {
      ...form,
      monthly_budget: Number.isFinite(form.monthly_budget)
        ? form.monthly_budget
        : 0,
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

  const startEdit = (row: any) => {
    setForm({
      name: row.name ?? "",
      platform: row.platform ?? "facebook",
      account_external_id: row.account_external_id ?? "",
      status: row.status ?? "active",
      monthly_budget: Number(row.monthly_budget ?? 0),
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Ad Accounts</h1>
          <p className="text-muted-foreground">
            Manage your Meta advertising accounts.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? "Edit Account" : "Add New Account"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={form.platform}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        platform: v as FormState["platform"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="messenger">Messenger</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="audience_network">
                        Audience Network
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Primary platform for this ad account.
                  </p>
                </div>

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
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>Monthly Budget</Label>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      type="number"
                      min={0}
                      step="100"
                      value={
                        Number.isFinite(form.monthly_budget)
                          ? form.monthly_budget
                          : 0
                      }
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          monthly_budget: Number(e.target.value || 0),
                        }))
                      }
                    />
                    <BadgeIndianRupee className="absolute right-3 top-2.5 h-4 w-4 opacity-70" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Planned monthly allocation.
                  </p>
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

              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />{" "}
                      {editingId ? "Update" : "Create"}
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
                    <th className="text-left py-3 pr-4">Platform</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Monthly Budget</th>
                    <th className="text-left py-3 pr-4">Currency</th>
                    <th className="text-left py-3 pr-4">Account ID</th>
                    <th className="text-left py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((acc: any) => (
                    <tr key={acc.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">{acc.name}</td>
                      <td className="py-3 pr-4 capitalize">{acc.platform}</td>
                      <td className="py-3 pr-4 capitalize">{acc.status}</td>
                      <td className="py-3 pr-4">
                        ₹{Number(acc.monthly_budget || 0).toLocaleString()}
                      </td>
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

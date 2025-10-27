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
import { useState } from "react";
import { useAdAccounts } from "@/hooks/adsCrud";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

const emptyForm = {
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
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isSaving = create.isLoading || update.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
        toast.success("Account updated");
      } else {
        await create.mutateAsync(form);
        toast.success("Account created");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  const startEdit = (row: any) => {
    setForm({
      name: row.name,
      platform: row.platform,
      account_external_id: row.account_external_id ?? "",
      status: row.status,
      monthly_budget: row.monthly_budget,
      currency: row.currency,
      notes: row.notes ?? "",
    });
    setEditingId(row.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ad Accounts</h1>
          <p className="text-muted-foreground">
            Manage your Meta advertising accounts manually.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Account" : "Add New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={form.platform}
                  onValueChange={(v) =>
                    setForm((f: any) => ({ ...f, platform: v }))
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
              </div>
              <div className="space-y-2">
                <Label>Meta Account ID</Label>
                <Input
                  placeholder="act_1234567890"
                  value={form.account_external_id}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      account_external_id: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f: any) => ({ ...f, status: v }))
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
                <Input
                  type="number"
                  min={0}
                  value={form.monthly_budget}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      monthly_budget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, currency: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {editingId ? "Update" : "Create"}
                    </>
                  )}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts List</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {list.isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading...
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
                  {list.data.map((acc) => (
                    <tr key={acc.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">{acc.name}</td>
                      <td className="py-3 pr-4 capitalize">{acc.platform}</td>
                      <td className="py-3 pr-4 capitalize">{acc.status}</td>
                      <td className="py-3 pr-4">
                        ₹{Number(acc.monthly_budget).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">{acc.currency}</td>
                      <td className="py-3 pr-4">
                        {acc.account_external_id || "-"}
                      </td>
                      <td className="py-3 pr-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(acc)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            await remove.mutateAsync(acc.id);
                            toast.success("Account deleted");
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

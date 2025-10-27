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
import { useState, useMemo } from "react";
import { useAdAccounts, useCampaigns } from "@/hooks/adsCrud";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/datepicker"; // if you have, else replace with Input type="date"
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";

const emptyForm = {
  account_id: "",
  name: "",
  objective: "",
  status: "draft",
  start_date: "",
  end_date: "",
  daily_budget: 0,
  spent: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
};

const Campaigns = () => {
  const { list: accounts } = useAdAccounts();
  const { list, create, update, remove } = useCampaigns();
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isSaving = create.isLoading || update.isLoading;

  const accountMap = useMemo(() => {
    const m: Record<string, string> = {};
    (accounts.data ?? []).forEach((a) => (m[a.id] = a.name));
    return m;
  }, [accounts.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_id) {
      toast.error("Please select an account");
      return;
    }
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
        toast.success("Campaign updated");
      } else {
        await create.mutateAsync(form);
        toast.success("Campaign created");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  const startEdit = (row: any) => {
    setForm({
      account_id: row.account_id,
      name: row.name,
      objective: row.objective ?? "",
      status: row.status,
      start_date: row.start_date ?? "",
      end_date: row.end_date ?? "",
      daily_budget: row.daily_budget,
      spent: row.spent,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
    });
    setEditingId(row.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            Manually add and monitor your campaigns.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Campaign" : "Add New Campaign"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <Label>Ad Account</Label>
                <Select
                  value={form.account_id}
                  onValueChange={(v) =>
                    setForm((f: any) => ({ ...f, account_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts.data ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label>Objective</Label>
                <Input
                  value={form.objective}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, objective: e.target.value }))
                  }
                  placeholder="Leads / Sales / Awareness..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, start_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.end_date || ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, end_date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Budget</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.daily_budget}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      daily_budget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Spent</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.spent}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      spent: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Impressions</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.impressions}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      impressions: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Clicks</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.clicks}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      clicks: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Conversions</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.conversions}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      conversions: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="md:col-span-3 flex gap-3">
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
            <CardTitle>Campaigns List</CardTitle>
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
                    <th className="text-left py-3 pr-4">Account</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Daily Budget</th>
                    <th className="text-left py-3 pr-4">Spent</th>
                    <th className="text-left py-3 pr-4">Impr.</th>
                    <th className="text-left py-3 pr-4">Clicks</th>
                    <th className="text-left py-3 pr-4">Conv.</th>
                    <th className="text-left py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((c) => (
                    <tr key={c.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">{c.name}</td>
                      <td className="py-3 pr-4">
                        {accountMap[c.account_id] || "-"}
                      </td>
                      <td className="py-3 pr-4 capitalize">{c.status}</td>
                      <td className="py-3 pr-4">
                        ₹{Number(c.daily_budget).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        ₹{Number(c.spent).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        {c.impressions.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">{c.clicks.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        {c.conversions.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            await remove.mutateAsync(c.id);
                            toast.success("Campaign deleted");
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
                No campaigns yet. Add your first campaign above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;

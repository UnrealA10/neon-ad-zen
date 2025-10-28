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
import { useTeam } from "@/hooks/adsCrude";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  role: "ads_manager",
  status: "active",
};

const Team = () => {
  const { list, create, update, remove } = useTeam();
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isSaving = create.isLoading || update.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name?.trim()) return toast.error("Full name required");
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
        toast.success("Member updated");
      } else {
        await create.mutateAsync(form);
        toast.success("Member added");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.message || "Error");
    }
  };

  const startEdit = (row: any) => {
    setForm({
      full_name: row.full_name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      role: row.role ?? "ads_manager",
      status: row.status ?? "active",
    });
    setEditingId(row.id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">
            Add your team members and their roles.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Member" : "Add New Member"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, full_name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f: any) => ({ ...f, role: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ads_manager">Ads Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="copywriter">Copywriter</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />{" "}
                      {editingId ? "Update" : "Add"}
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

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Team Directory</CardTitle>
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
                    <th className="text-left py-3 pr-4">Email</th>
                    <th className="text-left py-3 pr-4">Phone</th>
                    <th className="text-left py-3 pr-4">Role</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(list.data as any[]).map((m) => (
                    <tr key={m.id} className="border-b border-border/30">
                      <td className="py-3 pr-4">{m.full_name}</td>
                      <td className="py-3 pr-4">{m.email || "-"}</td>
                      <td className="py-3 pr-4">{m.phone || "-"}</td>
                      <td className="py-3 pr-4 capitalize">{m.role || "-"}</td>
                      <td className="py-3 pr-4 capitalize">
                        {m.status || "-"}
                      </td>
                      <td className="py-3 pr-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(m)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            await remove.mutateAsync(m.id);
                            toast.success("Member removed");
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
                No team members yet. Add some above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Team;

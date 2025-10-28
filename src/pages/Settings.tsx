import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id || null;
      setUserId(uid);
      if (uid) {
        const { data: p, error } = await supabase
          .from("profiles")
          .select("notes")
          .eq("id", uid)
          .single();
        if (!error && p?.notes) setNotes(p.notes);
      }
    })();
  }, []);

  const save = async () => {
    if (!userId) return toast.error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ notes })
      .eq("id", userId);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Account Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any personal notes…"
            />
            <Button onClick={save}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

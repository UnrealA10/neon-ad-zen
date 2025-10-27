import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Settings coming soon...</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

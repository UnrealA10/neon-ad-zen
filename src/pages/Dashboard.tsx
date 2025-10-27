import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, Target, Activity } from "lucide-react";
import { useCampaigns, useAdAccounts } from "@/hooks/adsCrud";
import { useMemo } from "react";

const Dashboard = () => {
  const { list: campaigns } = useCampaigns();
  const { list: accounts } = useAdAccounts();

  const summary = useMemo(() => {
    const rows = campaigns.data ?? [];
    const totalSpent = rows.reduce((s, r) => s + Number(r.spent || 0), 0);
    const totalConv = rows.reduce((s, r) => s + Number(r.conversions || 0), 0);
    const active = rows.filter((r) => r.status === "active").length;
    const accCount = (accounts.data ?? []).length;

    // Build simple month name agg using start_date month (fallback: all in "This Month")
    const monthlyMap: Record<string, { spend: number; conversions: number }> =
      {};
    rows.forEach((r) => {
      const d = r.start_date ? new Date(r.start_date) : new Date();
      const key = d.toLocaleString("en-US", { month: "short" });
      if (!monthlyMap[key]) monthlyMap[key] = { spend: 0, conversions: 0 };
      monthlyMap[key].spend += Number(r.spent || 0);
      monthlyMap[key].conversions += Number(r.conversions || 0);
    });
    const spendData = Object.entries(monthlyMap).map(([name, v]) => ({
      name,
      spend: v.spend,
      conversions: v.conversions,
    }));

    // Platform distribution from accounts
    const platMap: Record<string, number> = {};
    (accounts.data ?? []).forEach((a) => {
      platMap[a.platform] = (platMap[a.platform] || 0) + 1;
    });
    const platformData = Object.entries(platMap).map(([name, value]) => {
      const color =
        name === "facebook"
          ? "#415aff"
          : name === "instagram"
          ? "#E1306C"
          : name === "messenger"
          ? "#00B2FF"
          : name === "whatsapp"
          ? "#25D366"
          : "#9b87f5";
      return { name, value, color };
    });

    // Campaign performance basic bars
    const campaignPerformance = rows.slice(0, 8).map((r) => ({
      name: r.name,
      spend: Number(r.spent || 0),
      conversions: Number(r.conversions || 0),
    }));

    return {
      totalSpent,
      totalConv,
      active,
      accCount,
      spendData,
      platformData,
      campaignPerformance,
    };
  }, [campaigns.data, accounts.data]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your campaign performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Spend"
            value={`₹${summary.totalSpent.toLocaleString()}`}
            change="Manual data"
            icon={DollarSign}
            trend="up"
          />
          <MetricsCard
            title="Active Campaigns"
            value={String(summary.active)}
            change="Manual data"
            icon={TrendingUp}
            trend="up"
          />
          <MetricsCard
            title="Ad Accounts"
            value={String(summary.accCount)}
            change="Manual data"
            icon={Target}
          />
          <MetricsCard
            title="Total Conversions"
            value={String(summary.totalConv)}
            change="Manual data"
            icon={Activity}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Spend Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={
                    summary.spendData.length
                      ? summary.spendData
                      : [{ name: "—", spend: 0, conversions: 0 }]
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="#415aff"
                    strokeWidth={3}
                    dot={{ fill: "#415aff", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#4acaff"
                    strokeWidth={3}
                    dot={{ fill: "#4acaff", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={
                      summary.platformData.length
                        ? summary.platformData
                        : [{ name: "none", value: 1, color: "#9b87f5" }]
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {(summary.platformData.length
                      ? summary.platformData
                      : [{ color: "#9b87f5" }]
                    ).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry as any).color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  summary.campaignPerformance.length
                    ? summary.campaignPerformance
                    : [{ name: "—", spend: 0, conversions: 0 }]
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="spend" fill="#415aff" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="conversions"
                  fill="#4acaff"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

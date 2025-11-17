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
import { DollarSign, TrendingUp, Target, Activity, Star, Calendar, User, Eye } from "lucide-react";
import { useCampaigns, useAdAccounts } from "@/hooks/adsCrude";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { list: campaigns } = useCampaigns();
  const { list: accounts } = useAdAccounts();
  const navigate = useNavigate();

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

  const accountMap = useMemo(() => {
    const m: Record<string, string> = {};
    (accounts.data ?? []).forEach((a: any) => (m[a.id] = a.name));
    return m;
  }, [accounts.data]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header (search + date) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">My Campaigns</p>
          </div>

          {/* right-side controls removed as requested */}
        </div>

        {/* Hero row: Overview / Total Balance / Ads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">The sum of all amounts on my wallet.</p>
                  <div className="mt-3 text-2xl font-semibold">{summary.totalSpent ? `₹${summary.totalSpent.toLocaleString()}` : "₹0.00"}</div>
                  <div className="text-xs text-muted-foreground mt-1">3 persons and @you have access.</div>
                </div>

                <div className="w-36 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.spendData.length ? summary.spendData : [{ name: "—", spend: 0 }]}>
                      <Line type="monotone" dataKey="spend" stroke="#6EE7B7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-3xl font-bold">{summary.totalSpent ? `₹${(summary.totalSpent / 100).toFixed(2)}` : "₹0.00"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Yearly avg. ₹{((summary.totalSpent || 0) / 12).toFixed(2)}</div>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-40 h-24 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center text-xs text-muted-foreground">AI Assistant is updating the balance amount now.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quickly create and launch a new campaign.</p>
                  <div className="mt-4 text-sm">Add a campaign to start tracking performance across your accounts.</div>
                  <div className="text-xs text-muted-foreground mt-1">Create campaign records, set budgets and schedules — then monitor results.</div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/campaigns')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Add Campaign
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second row: Top Campaigns / Popular Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(campaigns.data ?? []).map((c) => (
                    <div key={c.id} className="p-4 bg-card rounded-md border border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-sm">{c.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">{c.portfolio_name || "-"} • {c.account_name || accountMap[c.account_id] || "-"}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs text-muted-foreground">{c.manager_name || "-"}</div>
                              <Star className={`h-4 w-4 ${c.favorite ? "text-yellow-400" : "text-muted-foreground"}`} />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <div>Start: {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}</div>
                              <div>End: {c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}</div>
                            </div>
                            <div>
                              <div>Daily: ₹{Number(c.daily_budget ?? 0).toLocaleString()}</div>
                              <div>Weekly: ₹{Number(c.weekly_budget ?? 0).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <div className="text-xs text-muted-foreground capitalize">{c.status}</div>
                            <div className="mt-2">
                              <button
                                onClick={() => navigate(`/campaigns?campaignId=${c.id}`)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 text-primary text-xs"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Popular Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {((campaigns.data ?? []).filter((c: any) => c.favorite) || []).slice(0, 6).length ? (
                    ((campaigns.data ?? []) as any[])
                      .filter((c: any) => c.favorite)
                      .slice(0, 6)
                      .map((c: any, i: number) => (
                        <div key={c.id || i} className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.portfolio_name || "-"} • {c.account_name || accountMap[c.account_id] || "-"}</div>
                            <div className="text-xs text-muted-foreground mt-1">Daily: ₹{Number(c.daily_budget || 0).toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <div>
                              <button
                                onClick={() => navigate(`/campaigns?campaignId=${c.id}`)}
                                className="inline-flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary text-xs"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">#{i + 1}</div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No favorite campaigns yet. Mark campaigns as favorite to see them here.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

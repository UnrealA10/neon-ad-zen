import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp, Target, Activity } from "lucide-react";

const Dashboard = () => {
  // Sample data
  const spendData = [
    { name: "Jan", spend: 4000, conversions: 240 },
    { name: "Feb", spend: 3000, conversions: 198 },
    { name: "Mar", spend: 5000, conversions: 380 },
    { name: "Apr", spend: 4500, conversions: 308 },
    { name: "May", spend: 6000, conversions: 480 },
    { name: "Jun", spend: 5500, conversions: 400 },
    { name: "Jul", spend: 7000, conversions: 550 },
  ];

  const platformData = [
    { name: "Facebook", value: 45, color: "#415aff" },
    { name: "Instagram", value: 35, color: "#4acaff" },
    { name: "Messenger", value: 20, color: "#9b87f5" },
  ];

  const campaignPerformance = [
    { name: "Campaign A", spend: 2400, conversions: 140, ctr: 3.2 },
    { name: "Campaign B", spend: 1800, conversions: 98, ctr: 2.8 },
    { name: "Campaign C", spend: 3200, conversions: 190, ctr: 4.1 },
    { name: "Campaign D", spend: 2800, conversions: 160, ctr: 3.5 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's your campaign performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total Balance"
            value="$45,231"
            change="+12.5% from last month"
            icon={DollarSign}
            trend="up"
          />
          <MetricsCard
            title="Active Campaigns"
            value="24"
            change="+3 new this week"
            icon={TrendingUp}
            trend="up"
          />
          <MetricsCard
            title="Ad Accounts"
            value="12"
            change="2 pending approval"
            icon={Target}
          />
          <MetricsCard
            title="Monthly Growth"
            value="18.2%"
            change="+4.3% vs last month"
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
                <LineChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
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
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
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
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey="spend" fill="#415aff" radius={[8, 8, 0, 0]} />
                <Bar dataKey="conversions" fill="#4acaff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

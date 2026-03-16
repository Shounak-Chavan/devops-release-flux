"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts"
import { FolderKanban, Flag, Zap, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  { name: 'Total Projects', value: '12', icon: FolderKanban, trend: '+2 this month', trendType: 'up' },
  { name: 'Total Flags', value: '156', icon: Flag, trend: '+14 this month', trendType: 'up' },
  { name: 'Active Flags', value: '94', icon: Zap, trend: '-3 this month', trendType: 'down' },
  { name: 'Total Environments', value: '48', icon: Globe, trend: '+4 this month', trendType: 'up' },
]

const rolloutData = [
  { name: 'Alpha Feature', percentage: 10 },
  { name: 'Beta Header', percentage: 25 },
  { name: 'New Checkout', percentage: 50 },
  { name: 'Dark Mode', percentage: 100 },
  { name: 'AI Assistant', percentage: 5 },
  { name: 'Legacy Cleanup', percentage: 80 },
]

const statusData = [
  { name: 'Enabled', value: 94 },
  { name: 'Disabled', value: 62 },
]

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))']

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time performance metrics and rollout distribution.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="glass-card hover:bg-white/[0.02] transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={stat.trendType === 'up' ? "bg-emerald-500/10 p-0.5 rounded" : "bg-rose-500/10 p-0.5 rounded"}>
                    {stat.trendType === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    )}
                  </div>
                  <p className={stat.trendType === 'up' ? "text-xs font-medium text-emerald-500" : "text-xs font-medium text-rose-500"}>
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 glass-card">
            <CardHeader>
              <CardTitle>Feature Rollouts</CardTitle>
              <CardDescription>Targeting distribution across production environments.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rolloutData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 glass-card">
            <CardHeader>
              <CardTitle>Flag Health</CardTitle>
              <CardDescription>Active vs. inactive configuration ratio.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

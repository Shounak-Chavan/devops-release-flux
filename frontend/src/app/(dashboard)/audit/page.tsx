"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  History, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"

const mockLogs = [
  {
    id: "log_1",
    action: "TOGGLED_ON",
    timestamp: "2026-03-06T15:20:00Z",
    flag: "Dark Mode 2.0",
    env: "Production",
    user: { name: "Sarah Chen", email: "sarah@featureflow.io", avatar: "SC" },
    prev: { isEnabled: false },
    next: { isEnabled: true }
  },
  {
    id: "log_2",
    action: "UPDATED_RULES",
    timestamp: "2026-03-06T14:45:00Z",
    flag: "AI Copilot Beta",
    env: "Development",
    user: { name: "Mark Wilson", email: "mark@featureflow.io", avatar: "MW" },
    prev: { rollout: 10 },
    next: { rollout: 25 }
  },
  {
    id: "log_3",
    action: "TOGGLED_OFF",
    timestamp: "2026-03-05T09:12:00Z",
    flag: "Legacy API Support",
    env: "Production",
    user: { name: "Sarah Chen", email: "sarah@featureflow.io", avatar: "SC" },
    prev: { isEnabled: true },
    next: { isEnabled: false }
  },
  {
    id: "log_4",
    action: "CREATED_FLAG",
    timestamp: "2026-03-04T16:30:00Z",
    flag: "New Header Experiment",
    env: "All",
    user: { name: "Alex Rivera", email: "alex@featureflow.io", avatar: "AR" },
    prev: null,
    next: { name: "New Header Experiment", key: "new-header-exp" }
  },
  {
    id: "log_5",
    action: "API_KEY_ROTATED",
    timestamp: "2026-03-04T11:20:00Z",
    flag: "HealthChain Portal",
    env: "Production",
    user: { name: "Alex Rivera", email: "alex@featureflow.io", avatar: "AR" },
    prev: { key: "****123" },
    next: { key: "****789" }
  }
]

export default function AuditLogs() {
  const getActionColor = (action: string) => {
    switch(action) {
      case 'TOGGLED_ON': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'TOGGLED_OFF': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'UPDATED_RULES': return 'bg-primary/10 text-primary border-primary/20';
      case 'CREATED_FLAG': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-white/5';
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">Complete history of system changes and user actions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/5">
              <Calendar className="mr-2 h-4 w-4" /> Filter Date
            </Button>
            <Button variant="outline" className="border-white/5">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 glass-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-white/5">
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/20">{log.user.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">{log.user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{log.flag}</span>
                      <Badge variant="secondary" className="w-fit text-[10px] h-4 px-1">{log.env}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs">
                      {log.prev ? (
                        <div className="flex items-center gap-1.5">
                          <span className="bg-muted/50 px-1.5 py-0.5 rounded border border-white/5 text-muted-foreground truncate max-w-[80px]">
                            {JSON.stringify(log.prev).replace(/[{}"']+/g, '')}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-4 border-dashed">New</Badge>
                      )}
                      <span className="bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 text-primary truncate max-w-[120px]">
                        {JSON.stringify(log.next).replace(/[{}"']+/g, '')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-sm text-muted-foreground">Showing 5 of 1,248 logs</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 border-white/5" disabled>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button variant="ghost" size="sm" className="h-8 border-white/5">
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
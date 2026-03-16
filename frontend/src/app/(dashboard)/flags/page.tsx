"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Filter, 
  History, 
  Settings2, 
  ChevronRight,
  MoreHorizontal
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockFlags = [
  {
    id: "flag_1",
    name: "Dark Mode 2.0",
    key: "dark-mode-v2",
    description: "Enables the new high-contrast dark mode for all users.",
    devStatus: true,
    prodStatus: false,
    rulesCount: 2,
    updatedAt: "2 hours ago"
  },
  {
    id: "flag_2",
    name: "AI Copilot Beta",
    key: "ai-copilot",
    description: "Enables the generative AI assistance panel in the editor.",
    devStatus: true,
    prodStatus: true,
    rulesCount: 5,
    updatedAt: "1 day ago"
  },
  {
    id: "flag_3",
    name: "Stripe Connect Integration",
    key: "billing-v3",
    description: "Uses the new Stripe Connect API for vendor payouts.",
    devStatus: false,
    prodStatus: false,
    rulesCount: 0,
    updatedAt: "3 days ago"
  },
  {
    id: "flag_4",
    name: "Legacy Analytics Cleanup",
    key: "cleanup-old-analytics",
    description: "Internal flag to disable sending data to old telemetry servers.",
    devStatus: true,
    prodStatus: false,
    rulesCount: 1,
    updatedAt: "5 mins ago"
  }
]

export default function Flags() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")

  const toggleFlag = (flagName: string, env: string, newState: boolean) => {
    toast({
      title: `${flagName} ${newState ? 'Enabled' : 'Disabled'}`,
      description: `Targeting updated for ${env} environment.`,
    })
  }

  const filteredFlags = mockFlags.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.key.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Feature Flags</h1>
            <p className="text-muted-foreground mt-1">Control application behavior in real-time without redeploying.</p>
          </div>
          <Button className="font-semibold shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Flag
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search flags by name or key..." 
              className="pl-10 glass-card border-white/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-white/5">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="rounded-xl border border-white/5 glass-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[300px]">Flag Detail</TableHead>
                <TableHead>Rules</TableHead>
                <TableHead className="text-center">Dev Env</TableHead>
                <TableHead className="text-center">Prod Env</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlags.map((flag) => (
                <TableRow key={flag.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold group-hover:text-primary transition-colors">{flag.name}</span>
                        <Badge variant="outline" className="text-[10px] h-4 border-white/10 font-mono">{flag.key}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1">{flag.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex w-fit gap-1 items-center bg-muted/50 border-white/5">
                      <Settings2 className="h-3 w-3" />
                      {flag.rulesCount} {flag.rulesCount === 1 ? 'rule' : 'rules'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch 
                        checked={flag.devStatus} 
                        onCheckedChange={(checked) => toggleFlag(flag.name, 'Dev', checked)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Switch 
                        checked={flag.prodStatus} 
                        onCheckedChange={(checked) => toggleFlag(flag.name, 'Prod', checked)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                        <a href={`/flags/rules?id=${flag.id}`}><ChevronRight className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
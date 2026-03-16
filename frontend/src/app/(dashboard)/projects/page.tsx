"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Copy, 
  MoreVertical, 
  ExternalLink, 
  Check, 
  Server,
  Code
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockProjects = [
  {
    id: "proj_123",
    name: "HealthChain Portal",
    description: "Main customer facing portal for healthcare providers.",
    environments: [
      { id: "env_dev", name: "Development", apiKey: "ff_test_abc123" },
      { id: "env_prod", name: "Production", apiKey: "ff_live_xyz789" },
    ]
  },
  {
    id: "proj_456",
    name: "Mobile App API",
    description: "Backend services for iOS and Android applications.",
    environments: [
      { id: "env_stg", name: "Staging", apiKey: "ff_stage_mnp456" },
      { id: "env_prod_2", name: "Production", apiKey: "ff_live_uvw123" },
    ]
  },
  {
    id: "proj_789",
    name: "Billing System",
    description: "Internal ledger and invoicing automation tools.",
    environments: [
      { id: "env_local", name: "Local", apiKey: "ff_local_qwerty" },
      { id: "env_prod_3", name: "Production", apiKey: "ff_live_asdfgh" },
    ]
  }
]

export default function Projects() {
  const { toast } = useToast()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast({
      title: "API Key Copied",
      description: "Key has been copied to your clipboard.",
    })
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your application environments and SDK keys.</p>
          </div>
          <Button className="font-semibold shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <Card key={project.id} className="glass-card group flex flex-col border-white/5 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem>Archive Project</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Environments</p>
                  {project.environments.map((env) => (
                    <div key={env.id} className="flex flex-col gap-2 p-3 rounded-lg bg-background/40 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={env.name === 'Production' ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px]">
                            {env.name}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-primary"
                          onClick={() => copyToClipboard(env.apiKey)}
                        >
                          {copiedKey === env.apiKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs bg-muted/30 p-1.5 rounded border border-white/5 text-muted-foreground overflow-hidden">
                        <Code className="h-3 w-3 shrink-0" />
                        <span className="truncate">{env.apiKey}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t border-white/5 p-4">
                <Button variant="outline" className="w-full h-9 gap-2 group/btn" asChild>
                  <a href={`/flags?projectId=${project.id}`}>
                    <Server className="h-4 w-4" />
                    Manage Flags
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          <button className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/5 bg-background/20 p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 group">
            <div className="rounded-full bg-muted/50 p-4 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-8 w-8" />
            </div>
            <span className="font-semibold">Add New Project</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
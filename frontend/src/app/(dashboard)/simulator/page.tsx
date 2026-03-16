"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Terminal, 
  Sparkles, 
  Play, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  Cpu,
  User,
  MapPin,
  Tag
} from "lucide-react"
import { generateSimulationAttributes } from "@/ai/flows/generate-simulation-attributes"
import { useToast } from "@/hooks/use-toast"

export default function Simulator() {
  const [scenario, setScenario] = useState("I am a premium user from Europe using a mobile device.")
  const [attributes, setAttributes] = useState<Record<string, any>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const { toast } = useToast()

  const handleExtractAttributes = async () => {
    setIsGenerating(true)
    try {
      const { attributes: extracted } = await generateSimulationAttributes({ scenarioDescription: scenario })
      setAttributes(extracted)
      toast({
        title: "Attributes Extracted",
        description: "AI successfully parsed your scenario into system attributes.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Extraction failed",
        description: "Could not parse the scenario. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const runSimulation = () => {
    setIsSimulating(true)
    // Mock simulation logic
    setTimeout(() => {
      setResults([
        { id: '1', name: 'Dark Mode 2.0', key: 'dark-mode-v2', enabled: true, reason: 'Rollout (100%)' },
        { id: '2', name: 'AI Copilot Beta', key: 'ai-copilot', enabled: attributes.tier === 'premium', reason: 'Rule: tier equals premium' },
        { id: '3', name: 'EU Privacy Banner', key: 'eu-banner', enabled: attributes.region === 'EU', reason: 'Rule: region equals EU' },
        { id: '4', name: 'Mobile Layout V2', key: 'mobile-v2', enabled: attributes.deviceType === 'mobile', reason: 'Rule: deviceType equals mobile' },
      ])
      setIsSimulating(false)
      toast({
        title: "Simulation Complete",
        description: "Evaluated 4 flags against your current context.",
      })
    }, 1200)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Flag Simulator</h1>
          <p className="text-muted-foreground mt-1">Test how feature flags will evaluate for specific user scenarios.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Describe Scenario
                </CardTitle>
                <CardDescription>Use natural language to define a test case.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="e.g. A premium user from the UK logged in on an Android device running app version 2.4.0"
                  className="min-h-[120px] bg-background/50"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                />
                <Button 
                  className="w-full font-semibold" 
                  onClick={handleExtractAttributes}
                  disabled={isGenerating || !scenario}
                >
                  {isGenerating ? (
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Cpu className="mr-2 h-4 w-4" />
                  )}
                  Extract Attributes with AI
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Tag className="h-5 w-5" />
                  Context Attributes
                </CardTitle>
                <CardDescription>Manual override for evaluation context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(attributes).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-xl text-muted-foreground">
                    <p className="text-sm">No attributes extracted yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(attributes).map(([key, val]) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{key}</Label>
                        <Input 
                          value={val} 
                          onChange={(e) => setAttributes({...attributes, [key]: e.target.value})}
                          className="h-8 bg-background/50 border-white/10"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:bg-primary/5"
                  onClick={() => setAttributes({})}
                >
                  Clear All
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-accent" />
                    Evaluation Results
                  </CardTitle>
                  <CardDescription>Outcome of the current simulation.</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/20"
                  onClick={runSimulation}
                  disabled={isSimulating || Object.keys(attributes).length === 0}
                >
                  {isSimulating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Run Simulation
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto min-h-[400px]">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                    <div className="rounded-full bg-muted/30 p-4">
                      <Terminal className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Ready to simulate</p>
                      <p className="text-sm text-muted-foreground/60">Configure your context and click Run.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((res) => (
                      <div key={res.id} className="p-4 rounded-xl bg-background/40 border border-white/5 flex items-center justify-between group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{res.name}</span>
                            <code className="text-[10px] bg-muted px-1 rounded text-muted-foreground">{res.key}</code>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            {res.reason}
                          </p>
                        </div>
                        <Badge 
                          className={res.enabled 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 gap-1" 
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20 px-3 py-1 gap-1"
                          }
                        >
                          {res.enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {res.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Plus, Trash2, Save, GripVertical } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RulesPage() {
  const { toast } = useToast()
  const [rollout, setRollout] = useState([25])
  const [rules, setRules] = useState([
    { id: 'rule-1', attribute: 'tier', operator: 'equals', value: 'premium' },
    { id: 'rule-2', attribute: 'region', operator: 'contains', value: 'EU' }
  ])

  const addRule = () => {
    setRules([...rules, { id: Math.random().toString(36).substr(2, 9), attribute: 'userId', operator: 'equals', value: '' }])
  }

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const handleSave = () => {
    toast({
      title: "Rules Updated",
      description: "Targeting rules for AI Copilot Beta have been saved to Production.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Link href="/flags" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Flags
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Targeting Rules</h1>
            <p className="text-muted-foreground mt-1">AI Copilot Beta <span className="text-[10px] font-mono bg-muted px-1 rounded ml-2">ai-copilot</span></p>
          </div>
          <Button onClick={handleSave} className="gap-2 px-6 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <div className="grid gap-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Global Rollout</CardTitle>
              <CardDescription>Determine the percentage of users who will see this feature.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{rollout}%</span>
                  <span className="text-sm text-muted-foreground">Approx. 4.2k users impacted</span>
                </div>
                <Slider 
                  value={rollout} 
                  onValueChange={setRollout} 
                  max={100} 
                  step={1} 
                  className="py-4"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Custom Targeting Rules</h3>
              <Button variant="outline" size="sm" onClick={addRule} className="gap-2 border-white/10 hover:bg-white/5">
                <Plus className="h-4 w-4" />
                Add Condition
              </Button>
            </div>

            <div className="space-y-4">
              {rules.map((rule, index) => (
                <Card key={rule.id} className="glass-card bg-[#111827]/40">
                  <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 w-full">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-move" />
                      <div className="grid gap-1.5 flex-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Attribute</Label>
                        <Select defaultValue={rule.attribute}>
                          <SelectTrigger className="bg-background/50 border-white/10 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="userId">User ID</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tier">Subscription Tier</SelectItem>
                            <SelectItem value="region">Region</SelectItem>
                            <SelectItem value="appVersion">App Version</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5 flex-1">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Operator</Label>
                        <Select defaultValue={rule.operator}>
                          <SelectTrigger className="bg-background/50 border-white/10 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="starts_with">Starts With</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5 flex-[1.5]">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Value</Label>
                        <Input 
                          defaultValue={rule.value} 
                          className="bg-background/50 border-white/10 h-10"
                          placeholder="Enter value..."
                        />
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mt-5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

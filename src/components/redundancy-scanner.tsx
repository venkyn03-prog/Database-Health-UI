
"use client"

import * as React from "react"
import { 
  ShieldAlert, 
  Search, 
  RefreshCw, 
  Archive, 
  ShieldCheck,
  X,
  Table as TableIcon,
  Zap,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { MaintenanceAction, DatabaseInstance } from "@/app/page"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RedundantItem = {
  name: string
  type: "Table" | "Index"
  reason: "Naming issue" | "Zero reads" | "Duplicate schema" | "Unused"
  lastAccessed: string
  size: string
}

const MOCK_REDUNDANCIES: Record<string, RedundantItem[]> = {
  "WebPortalDB": [
    { name: "users_backup_2023", type: "Table", reason: "Naming issue", lastAccessed: "142 days ago", size: "1.2 GB" },
    { name: "temp_orders_old", type: "Table", reason: "Naming issue", lastAccessed: "Never", size: "840 MB" },
    { name: "IX_old_audit_trail", type: "Index", reason: "Unused", lastAccessed: "210 days ago", size: "2.5 GB" },
    { name: "customer_profiles_v2", type: "Table", reason: "Duplicate schema", lastAccessed: "12 days ago", size: "420 MB" },
    { name: "IX_temp_session", type: "Index", reason: "Unused", lastAccessed: "Never", size: "540 MB" },
  ],
  "ReportingDB": [
    { name: "sales_2022_final", type: "Table", reason: "Zero reads", lastAccessed: "380 days ago", size: "45 GB" },
    { name: "IX_legacy_sales", type: "Index", reason: "Unused", lastAccessed: "1 year ago", size: "8.2 GB" },
    { name: "legacy_reports_v1", type: "Table", reason: "Zero reads", lastAccessed: "1 year ago", size: "12.4 GB" },
  ]
}

const DEFAULT_REDUNDANCIES: RedundantItem[] = [
  { name: "staging_data_temp_copy", type: "Table", reason: "Naming issue", lastAccessed: "89 days ago", size: "2.4 GB" },
  { name: "old_audit_logs_archive", type: "Table", reason: "Zero reads", lastAccessed: "Never", size: "18.2 GB" },
  { name: "IX_duplicate_idx", type: "Index", reason: "Duplicate schema", lastAccessed: "210 days ago", size: "540 MB" },
]

export function RedundancyScanner({ 
  activeDb = "WebPortalDB", 
  serverName = "SQLSRV-PROD-01",
  databases,
  onCreateTask 
}: { 
  activeDb?: string, 
  serverName?: string,
  databases: DatabaseInstance[],
  onCreateTask: (task: any) => void 
}) {
  const [isScanning, setIsScanning] = React.useState(false)
  const [scanResults, setScanResults] = React.useState<RedundantItem[]>(MOCK_REDUNDANCIES[activeDb] || DEFAULT_REDUNDANCIES)
  
  const [selectedItems, setSelectedItems] = React.useState<string[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false)
  const [taskName, setTaskName] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState<MaintenanceAction>('Scanning')
  const [targetDatabase, setTargetDatabase] = React.useState("")

  React.useEffect(() => {
    setScanResults(MOCK_REDUNDANCIES[activeDb] || DEFAULT_REDUNDANCIES)
    setSelectedItems([])
  }, [activeDb])

  const handleRunScan = () => {
    setIsScanning(true)
    setSelectedItems([])
    setTimeout(() => {
      const results = MOCK_REDUNDANCIES[activeDb] || DEFAULT_REDUNDANCIES
      setScanResults(results)
      setIsScanning(false)
      toast({
        title: "Scan Complete",
        description: `Identified ${results.length} potentially redundant objects in ${activeDb}.`,
      })
    }, 1500)
  }

  const isAllSelected = scanResults.length > 0 && selectedItems.length === scanResults.length

  const handleToggleAll = () => {
    if (isAllSelected) setSelectedItems([])
    else setSelectedItems(scanResults.map(t => t.name))
  }

  const handleToggleOne = (name: string) => {
    setSelectedItems(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const openTaskCreation = (initialAction: MaintenanceAction) => {
    setSelectedAction(initialAction)
    setTaskName(`${initialAction} Task - ${new Date().toLocaleDateString()}`)
    setTargetDatabase("")
    setIsTaskModalOpen(true)
  }

  const handleFinalizeTask = () => {
    const isArchiving = selectedAction === 'Archiving'
    if (isArchiving && !targetDatabase) {
      toast({
        variant: "destructive",
        title: "Target Database Required",
        description: "Please specify target database for archival operations.",
      })
      return
    }

    onCreateTask({
      name: taskName,
      type: selectedAction,
      server: serverName,
      database: activeDb,
      tables: [...selectedItems],
      targetDatabase: isArchiving ? targetDatabase : undefined
    })
    
    setIsTaskModalOpen(false)
    setSelectedItems([])
    toast({
      title: "Task Created",
      description: `Task for ${selectedItems.length} objects added to the Task Manager.`,
    })
  }

  const availableTargets = React.useMemo(() => {
    return databases.filter(db => db.name !== activeDb)
  }, [databases, activeDb])

  const totalSize = scanResults.reduce((acc, curr) => {
    const val = parseFloat(curr.size)
    return acc + (curr.size.includes('GB') ? val : val / 1024)
  }, 0).toFixed(1)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Redundancy Scan</h1>
          <Badge className="bg-[#E6F4EA] text-[#1E8E3E] hover:bg-[#E6F4EA] border-none font-medium px-2 py-0.5 text-[10px]">
            {activeDb}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pattern match: _backup, _old, temp_, unused_idx</span>
          <Button 
            onClick={handleRunScan} 
            disabled={isScanning}
            className="h-9 bg-[#1E8E3E] hover:bg-[#1A7F37] text-white text-xs font-bold rounded-lg px-6 shadow-sm gap-2"
          >
            {isScanning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Rescan Database
          </Button>
        </div>
      </div>

      {isScanning ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse h-24 bg-white border-none shadow-sm" />
            ))}
          </div>
          <Card className="animate-pulse h-96 bg-white border-none shadow-sm" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border-none shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Redundant suspected</span>
                <div className="text-xl font-bold text-slate-900">{scanResults.length} Objects</div>
                <div className="text-[10px] text-amber-600 font-bold">Tables & Indexes</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Potential savings</span>
                <div className="text-xl font-bold text-[#1E8E3E]">{totalSize} GB</div>
                <div className="text-[10px] text-slate-400 font-bold">Reclaimable space</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Unused Indexes</span>
                <div className="text-xl font-bold text-slate-900">
                  {scanResults.filter(t => t.type === "Index").length}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Zero read impact</div>
              </CardContent>
            </Card>
            <Card className="bg-white border-none shadow-sm rounded-xl">
              <CardContent className="p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Naming issues</span>
                <div className="text-xl font-bold text-slate-900">
                  {scanResults.filter(t => t.reason === "Naming issue").length}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">Pattern matches</div>
              </CardContent>
            </Card>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-3 px-6 bg-[#E8F0FE] border border-[#D2E3FC] rounded-2xl animate-in slide-in-from-top-2 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#1967D2] mr-4 whitespace-nowrap flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#1967D2] animate-pulse" />
                  {selectedItems.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => openTaskCreation("Scanning")} 
                    className="h-10 px-6 rounded-full bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold shadow-sm gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Mark Safe
                  </Button>
                  <Button 
                    onClick={() => openTaskCreation("Archiving")} 
                    className="h-10 px-6 rounded-full bg-white hover:bg-amber-50 text-amber-600 border border-amber-100 font-bold shadow-sm gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button 
                    onClick={() => openTaskCreation("Update Stats")} 
                    className="h-10 px-6 rounded-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 font-bold shadow-sm gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Drop Object
                  </Button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedItems([])}
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-6 pb-2 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Redundancy findings</CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Identified via sys.dm_db_index_usage_stats & schema analysis</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-12 text-center">
                      <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} className="h-4 w-4" />
                    </TableHead>
                    <TableHead className="h-10 text-[9px] font-bold uppercase text-slate-400">Object Name</TableHead>
                    <TableHead className="h-10 text-[9px] font-bold uppercase text-slate-400">Type</TableHead>
                    <TableHead className="h-10 text-[9px] font-bold uppercase text-slate-400">Reason</TableHead>
                    <TableHead className="h-10 text-[9px] font-bold uppercase text-slate-400">Size</TableHead>
                    <TableHead className="h-10 text-[9px] font-bold uppercase text-slate-400 px-6">Last Accessed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults.length > 0 ? (
                    scanResults.map((item, i) => (
                      <TableRow key={i} className={cn("group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0", selectedItems.includes(item.name) && "bg-slate-50/80")}>
                        <TableCell className="text-center">
                          <Checkbox checked={selectedItems.includes(item.name)} onCheckedChange={() => handleToggleOne(item.name)} className="h-4 w-4" />
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            {item.type === "Index" ? <Zap className="h-3 w-3 text-amber-500" /> : <TableIcon className="h-3 w-3 text-slate-400" />}
                            <span className="text-xs font-bold text-slate-800">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-[10px] font-bold text-slate-400 uppercase">{item.type}</TableCell>
                        <TableCell className="py-3">
                          <Badge 
                            className={cn(
                              "font-bold text-[8px] px-2 py-0.5 rounded border-none shadow-none uppercase tracking-tighter",
                              item.reason === "Naming issue" && "bg-amber-50 text-amber-600",
                              item.reason === "Zero reads" && "bg-rose-50 text-rose-600",
                              item.reason === "Unused" && "bg-purple-50 text-purple-600",
                              item.reason === "Duplicate schema" && "bg-blue-50 text-blue-600"
                            )}
                          >
                            {item.reason}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-slate-600">
                          {item.size}
                        </TableCell>
                        <TableCell className="py-3 px-6">
                          <span className={cn(
                            "text-[10px] font-bold",
                            item.lastAccessed === "Never" ? "text-rose-500" : "text-slate-400"
                          )}>
                            {item.lastAccessed}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        No redundancies identified in {activeDb}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              Configure Maintenance Task
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Assign a maintenance action for {selectedItems.length} selected objects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="redundancy-task-name" className="text-sm font-bold text-slate-700">Task Name</Label>
              <Input 
                id="redundancy-task-name" 
                value={taskName} 
                onChange={(e) => setTaskName(e.target.value)} 
                className="h-11 border-slate-200 rounded-xl" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Maintenance Type</Label>
              <Select value={selectedAction} onValueChange={(v: MaintenanceAction) => setSelectedAction(v)}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scanning">Scanning</SelectItem>
                  <SelectItem value="Archiving">Archiving</SelectItem>
                  <SelectItem value="Index Rebuild">Index Rebuild</SelectItem>
                  <SelectItem value="Update Stats">Update Stats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedAction === 'Archiving' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Target Database</Label>
                  <Select value={targetDatabase} onValueChange={setTargetDatabase}>
                    <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder="Select Target DB" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets.map(db => (
                        <SelectItem key={db.name} value={db.name}>{db.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">Affected Objects ({selectedItems.length})</Label>
              <div className="border rounded-2xl bg-slate-50/50 p-1 border-slate-100 overflow-hidden">
                <ScrollArea className="h-[120px]">
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {selectedItems.map(t => (
                      <div key={t} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <Activity className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700 truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-50/50 p-6 -mx-6 -mb-6 border-t rounded-b-[2rem]">
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="rounded-xl font-bold h-11 px-8">Cancel</Button>
            <Button 
              onClick={handleFinalizeTask} 
              disabled={!taskName || !selectedAction || (selectedAction === 'Archiving' && !targetDatabase)} 
              className={cn(
                "font-bold h-11 px-10 rounded-xl shadow-lg text-white",
                selectedAction === 'Scanning' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" :
                selectedAction === 'Archiving' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" :
                "bg-slate-600 hover:bg-slate-700 shadow-slate-100"
              )}
            >
              Confirm & Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

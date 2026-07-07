
"use client"

import * as React from "react"
import { 
  X,
  Table as TableIcon,
  RefreshCw,
  Zap,
  Archive,
  Database,
  Server as ServerIcon,
  ArrowLeft,
  Search as SearchIcon,
  Activity,
  Plus,
  Clock,
  ShieldAlert,
  History
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TableDetailsView } from "./table-details-view"
import { MaintenanceAction, DatabaseInstance } from "@/app/page"

export type TableData = {
  name: string
  schema: string
  status: string
  statusVariant: "critical" | "warning" | "healthy"
  rowCount: string
  size: string
  fragmentation: number
  lastRead: string
  deadlocks: number
  slowQueries: number
  lastArchivedOn: string
  archivedTill: string
  usageContext: string
}

const ALL_MOCK_TABLES: TableData[] = [
  { name: "Auth_Consult_Notes", schema: "dbo", status: "Healthy", statusVariant: "healthy", rowCount: "609,251", size: "420 MB", fragmentation: 8, lastRead: "1h ago", deadlocks: 0, slowQueries: 2, lastArchivedOn: "2024-03-01", archivedTill: "2023-12-31", usageContext: "Last two scans - this table was accessed 14 times" },
  { name: "Claims_inquiry_Response", schema: "dbo", status: "Healthy", statusVariant: "healthy", rowCount: "44,738", size: "85 MB", fragmentation: 12, lastRead: "2h ago", deadlocks: 0, slowQueries: 0, lastArchivedOn: "2024-02-15", archivedTill: "2023-10-01", usageContext: "Last two scans - this table was accessed 8 times" },
  { name: "POST_DISMISSALS", schema: "dbo", status: "Warning", statusVariant: "warning", rowCount: "1,586,110", size: "2.1 GB", fragmentation: 24, lastRead: "30m ago", deadlocks: 2, slowQueries: 5, lastArchivedOn: "2024-01-20", archivedTill: "2023-09-01", usageContext: "Last two scans - this table was accessed 42 times" },
  { name: "PROV_CONSULT_NOTES", schema: "dbo", status: "Critical", statusVariant: "critical", rowCount: "5,570,747", size: "12.4 GB", fragmentation: 52, lastRead: "15m ago", deadlocks: 8, slowQueries: 12, lastArchivedOn: "2024-03-08", archivedTill: "2024-01-01", usageContext: "Last two scans - this table was accessed 112 times" },
  { name: "REQUEST_LOG", schema: "audit", status: "Healthy", statusVariant: "healthy", rowCount: "331,196", size: "180 MB", fragmentation: 5, lastRead: "5m ago", deadlocks: 0, slowQueries: 1, lastArchivedOn: "Never", archivedTill: "N/A", usageContext: "Last two scans - this table was accessed 210 times" },
  { name: "USERS", schema: "auth", status: "Healthy", statusVariant: "healthy", rowCount: "154,494", size: "45 MB", fragmentation: 4, lastRead: "1m ago", deadlocks: 0, slowQueries: 0, lastArchivedOn: "Never", archivedTill: "N/A", usageContext: "Last two scans - this table was accessed 450 times" },
  { name: "WEB_AUDIT_TRAIL", schema: "audit", status: "Critical", statusVariant: "critical", rowCount: "58,548,194", size: "142 GB", fragmentation: 62, lastRead: "Now", deadlocks: 24, slowQueries: 45, lastArchivedOn: "2024-03-10", archivedTill: "2023-12-01", usageContext: "Last two scans - this table was accessed 890 times" },
  { name: "WEB_AUTH_DETAILS", schema: "auth", status: "Critical", statusVariant: "critical", rowCount: "22,069,814", size: "32.1 GB", fragmentation: 59, lastRead: "Now", deadlocks: 18, slowQueries: 32, lastArchivedOn: "2024-03-12", archivedTill: "2024-02-01", usageContext: "Last two scans - this table was accessed 640 times" },
  { name: "WEB_AUTH_NOTES", schema: "auth", status: "Critical", statusVariant: "critical", rowCount: "31,693,191", size: "88.4 GB", fragmentation: 68, lastRead: "Now", deadlocks: 32, slowQueries: 15, lastArchivedOn: "2024-03-14", archivedTill: "2024-02-15", usageContext: "Last two scans - this table was accessed 2 times" },
  { name: "USER_PROVIDERS", schema: "auth", status: "Critical", statusVariant: "critical", rowCount: "9,098,052", size: "8.2 GB", fragmentation: 48, lastRead: "2m ago", deadlocks: 12, slowQueries: 8, lastArchivedOn: "2024-02-28", archivedTill: "2024-01-01", usageContext: "Last two scans - this table was accessed 180 times" },
]

const JOB_TYPES: { id: MaintenanceAction; label: string; icon: any; color: string; bg: string; border: string }[] = [
  { id: 'Archiving', label: 'Archiving', icon: Archive, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'Index Rebuild', label: 'Index Rebuild', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'Update Stats', label: 'Update Stats', icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'Scanning', label: 'Scanning', icon: SearchIcon, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
]

export function TableManager({ 
  activeDb, 
  serverName, 
  monitoredTables,
  databases,
  onCreateTask 
}: { 
  activeDb: string, 
  serverName: string,
  monitoredTables: string[],
  databases: DatabaseInstance[],
  onCreateTask: (task: any) => void 
}) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedTables, setSelectedTables] = React.useState<string[]>([])
  const [viewMode, setViewMode] = React.useState<'list' | 'details'>('list')
  const [selectedTableForDetails, setSelectedTableForDetails] = React.useState<TableData | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false)
  const [taskName, setTaskName] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState<MaintenanceAction>('Archiving')
  const [targetDatabase, setTargetDatabase] = React.useState("")
  const [targetTable, setTargetTable] = React.useState("")

  const activeTables = React.useMemo(() => {
    return ALL_MOCK_TABLES.filter(t => monitoredTables.includes(t.name))
  }, [monitoredTables])

  const stats = React.useMemo(() => {
    if (activeTables.length === 0) {
      return { size: "0 GB", avgFrag: "0%", deadlocks: "0", tables: "0" }
    }
    
    const totalTables = activeTables.length
    const totalDeadlocks = activeTables.reduce((acc, t) => acc + t.deadlocks, 0)
    const sumFrag = activeTables.reduce((acc, t) => acc + t.fragmentation, 0)
    const avgFrag = Math.round(sumFrag / totalTables)
    
    const totalSizeGB = activeTables.reduce((acc, t) => {
      const val = parseFloat(t.size)
      if (t.size.includes('GB')) return acc + val
      if (t.size.includes('MB')) return acc + (val / 1024)
      return acc
    }, 0)
    
    const sizeStr = totalSizeGB >= 1 
      ? `${totalSizeGB.toFixed(1)} GB` 
      : `${(totalSizeGB * 1024).toFixed(0)} MB`

    return {
      tables: totalTables.toString(),
      size: sizeStr,
      avgFrag: `${avgFrag}%`,
      deadlocks: totalDeadlocks.toString()
    }
  }, [activeTables])

  const filteredTables = React.useMemo(() => {
    return activeTables.filter(table => {
      const matchesSearch = table.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || table.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [activeTables, search, statusFilter])

  const isAllSelected = filteredTables.length > 0 && selectedTables.length === filteredTables.length

  const handleToggleAll = () => {
    if (isAllSelected) setSelectedTables([])
    else setSelectedTables(filteredTables.map(t => t.name))
  }

  const handleToggleOne = (name: string) => {
    setSelectedTables(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const openTaskCreation = () => {
    setTaskName(`Task - ${new Date().toLocaleDateString()}`)
    setSelectedAction('Archiving')
    setTargetDatabase("")
    setTargetTable("")
    setIsTaskModalOpen(true)
  }

  const handleFinalizeTask = () => {
    const isArchiving = selectedAction === 'Archiving'
    if (isArchiving && (!targetDatabase || !targetTable)) {
      toast({
        variant: "destructive",
        title: "Archival Targets Required",
        description: "Please specify target database and table for archival operations.",
      })
      return
    }
    
    onCreateTask({
      name: taskName,
      type: selectedAction,
      server: serverName,
      database: activeDb,
      tables: [...selectedTables],
      targetDatabase: isArchiving ? targetDatabase : undefined,
      targetTable: isArchiving ? targetTable : undefined
    })
    setIsTaskModalOpen(false)
    setSelectedTables([])
    toast({
      title: "Task Created",
      description: `Task "${taskName}" has been added to the Task Manager.`,
    })
  }

  const availableTargets = React.useMemo(() => {
    return databases.filter(db => db.name !== activeDb)
  }, [databases, activeDb])

  if (viewMode === 'details' && selectedTableForDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{selectedTableForDetails.name}</h1>
              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-400 text-[9px] font-bold uppercase tracking-tight py-0 h-5">
                Last Scan: today 08:42 AM
              </Badge>
            </div>
            <p className="text-sm text-slate-400 font-medium">Detailed Analytics & Health Insights</p>
          </div>
        </div>
        <TableDetailsView table={selectedTableForDetails} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tables</div>
            <div className="text-3xl font-bold text-slate-900">{stats.tables}</div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">DB Size</div>
            <div className="text-3xl font-bold text-slate-900">{stats.size}</div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Fragmentation</div>
            <div className="text-3xl font-bold text-amber-500">{stats.avgFrag}</div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Buffer Cache Hit Ratio</div>
            <div className="text-3xl font-bold text-emerald-500">91.4%</div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deadlocks (24h)</div>
            <div className="text-3xl font-bold text-slate-900">{stats.deadlocks}</div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900">Active monitored tables</h2>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">{filteredTables.length} result(s)</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input 
                placeholder="Search monitored tables..." 
                className="h-8 text-xs pl-8 w-48 bg-white border-slate-200 rounded-lg shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-28 bg-white border-slate-200 rounded-lg shadow-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedTables.length > 0 && (
          <div className="flex items-center justify-between p-3 px-6 bg-[#E8F0FE] border border-[#D2E3FC] rounded-2xl animate-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#1967D2] mr-4 whitespace-nowrap flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#1967D2] animate-pulse" />
                {selectedTables.length} selected
              </span>
              <Button 
                onClick={openTaskCreation} 
                className="h-10 px-6 rounded-xl bg-[#1967D2] hover:bg-[#185ABC] text-white font-bold shadow-md gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedTables([])}
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} className="h-4 w-4" />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Table name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Health</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Rows</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Size</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Frag %</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Deadlocks</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Slow Qs</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Last Read</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Last Archive</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-slate-400">Archived Till</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase text-slate-400 pr-8">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table, i) => (
                <TableRow key={i} className={cn("group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0", selectedTables.includes(table.name) && "bg-slate-50/80")}>
                  <TableCell className="text-center">
                    <Checkbox checked={selectedTables.includes(table.name)} onCheckedChange={() => handleToggleOne(table.name)} className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{table.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{table.schema}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("font-bold text-[9px] px-2 py-0.5 rounded border-none shadow-none", table.statusVariant === "critical" ? "bg-rose-50 text-rose-500" : table.statusVariant === "warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                      {table.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600">{table.rowCount}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600">{table.size}</TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-bold", table.fragmentation > 30 ? "text-amber-600" : "text-slate-600")}>
                      {table.fragmentation}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Activity className="h-3 w-3 text-slate-300" />
                      {table.deadlocks}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-amber-600">{table.slowQueries}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-500">{table.lastRead}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <History className="h-3 w-3 text-primary opacity-50" />
                      {table.lastArchivedOn}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-400">
                      {table.archivedTill}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTableForDetails(table); setViewMode('details'); }} className="h-7 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <RefreshCw className="h-6 w-6 text-primary" />
              Configure Maintenance Task
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">Define a single maintenance action for your selected tables.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name" className="text-sm font-bold text-slate-700">Task Name</Label>
              <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g., Weekly Audit Scan" className="h-11 border-slate-200 rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Maintenance Type</Label>
              <Select value={selectedAction} onValueChange={(v: MaintenanceAction) => setSelectedAction(v)}>
                <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-white">
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((action) => (
                    <SelectItem key={action.id} value={action.id}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAction === 'Archiving' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
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
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Target Table</Label>
                  <Select value={targetTable} onValueChange={setTargetTable}>
                    <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-white">
                      <SelectValue placeholder="Select Target Table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MPM_ARCHIVE_MAIN">MPM_ARCHIVE_MAIN</SelectItem>
                      <SelectItem value="HIST_AUDIT_LOGS">HIST_AUDIT_LOGS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700">Affected Tables Preview ({selectedTables.length})</Label>
              <div className="border rounded-2xl bg-slate-50/50 p-1 border-slate-100 overflow-hidden">
                <ScrollArea className="h-[120px]">
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {selectedTables.map(t => (
                      <div key={t} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <TableIcon className="h-3.5 w-3.5 text-slate-400" />
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
            <Button onClick={handleFinalizeTask} disabled={!taskName || !selectedAction} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-10 rounded-xl shadow-lg shadow-primary/10">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

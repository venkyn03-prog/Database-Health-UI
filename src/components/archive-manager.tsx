
"use client"

import * as React from "react"
import { 
  Archive, 
  Search, 
  MoreVertical, 
  FileCode, 
  Server, 
  Database, 
  ArrowLeft, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Code, 
  Clock, 
  Calendar,
  Search as SearchIcon,
  RefreshCw,
  LayoutGrid,
  Play,
  CheckCircle2,
  Settings2,
  ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MaintenanceTask, ScheduleConfig } from "@/app/page"
import { cn } from "@/lib/utils"
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
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

type ViewState = 'list' | 'task-details' | 'query-builder' | 'execution-view'

type QueryRow = {
  id: string
  column: string
  operator: string
  value: string
  logic: string
}

export function ArchiveManager({ 
  tasks, 
  onUpdateTask,
  onViewChange,
  initialTab = "Archiving"
}: { 
  tasks: MaintenanceTask[], 
  onUpdateTask: (id: string, updates: Partial<MaintenanceTask>) => void,
  onViewChange: (view: string) => void,
  initialTab?: string
}) {
  const [view, setView] = React.useState<ViewState>('list')
  const [selectedTask, setSelectedTask] = React.useState<MaintenanceTask | null>(null)
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [maintainIntegrity, setMaintainIntegrity] = React.useState(true)

  React.useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false)
  const [taskToSchedule, setTaskToSchedule] = React.useState<MaintenanceTask | null>(null)
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleConfig>({
    frequency: 'Daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const [queryRows, setQueryRows] = React.useState<QueryRow[]>([
    { id: '1', column: 'created_at', operator: '<=', value: "DATEADD(year, -5, GETDATE())", logic: 'AND' }
  ])

  const handleTaskClick = (task: MaintenanceTask) => {
    setSelectedTask(task)
    setView('task-details')
  }

  const handleViewExecution = (task: MaintenanceTask) => {
    setSelectedTask(task)
    setView('execution-view')
  }

  const handleConfigureQuery = (tableName: string) => {
    setSelectedTable(tableName)
    setView('query-builder')
  }

  const handleBack = () => {
    if (view === 'query-builder') setView('task-details')
    else if (view === 'task-details' || view === 'execution-view') setView('list')
  }

  const addQueryRow = () => {
    setQueryRows([...queryRows, { id: Date.now().toString(), column: 'created_at', operator: '=', value: '', logic: 'AND' }])
  }

  const removeQueryRow = (id: string) => {
    setQueryRows(queryRows.filter(row => row.id !== id))
  }

  const updateRow = (id: string, field: keyof QueryRow, value: string) => {
    setQueryRows(queryRows.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  const openScheduleDialog = (e: React.MouseEvent, task: MaintenanceTask) => {
    e.stopPropagation()
    setTaskToSchedule(task)
    setIsScheduleModalOpen(true)
  }

  const handleFinalizeSchedule = () => {
    if (taskToSchedule) {
      onUpdateTask(taskToSchedule.id, {
        status: 'scheduled',
        schedule: scheduleForm
      })
      setIsScheduleModalOpen(false)
      toast({
        title: "Task Scheduled",
        description: `"${taskToSchedule.name}" is now active in the Scheduler.`
      })
      onViewChange("maintenance")
    }
  }

  if (view === 'execution-view' && selectedTask) {
    const totalTables = selectedTask.tables.length
    const completedTables = Math.floor(totalTables * 0.75)
    const successRate = 98.4
    const duration = "1h 14m"
    const progressValue = (completedTables / totalTables) * 100

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Execution Monitor</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Activity className="h-3 w-3 text-primary" />
                <span>Monitoring: {selectedTask.name}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-2 px-3 py-1 font-bold">
            <RefreshCw className="h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tables Completed</span>
              <div className="text-3xl font-bold text-slate-900">{completedTables} / {totalTables}</div>
            </div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
              <div className="text-3xl font-bold text-emerald-600">{successRate}%</div>
            </div>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Duration</span>
              <div className="text-3xl font-bold text-slate-900">{duration}</div>
            </div>
          </Card>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-700">Overall Task Progress</span>
              <span className="text-primary">{progressValue.toFixed(0)}%</span>
            </div>
            <Progress value={progressValue} className="h-3 bg-slate-100" />
          </div>

          <div className="pt-6">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-12 px-6 text-[10px] font-bold uppercase text-slate-400">Table Name</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Status</TableHead>
                  <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Records Processed</TableHead>
                  <TableHead className="h-12 px-6 text-right text-[10px] font-bold uppercase text-slate-400">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTask.tables.map((table, i) => (
                  <TableRow key={table} className="hover:bg-slate-50/50 border-b border-slate-50">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <TableIcon className="h-4 w-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{table}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {i < completedTables ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase px-2">Completed</Badge>
                      ) : i === completedTables ? (
                        <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[9px] uppercase px-2">Running</Badge>
                      ) : (
                        <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase px-2">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">
                      {i < completedTables ? "1,240,500" : i === completedTables ? "450,210" : "0"}
                    </TableCell>
                    <TableCell className="px-6 text-right text-xs font-bold text-slate-600">
                      {i < completedTables ? "12m" : i === completedTables ? "4m" : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    )
  }

  if (view === 'query-builder') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Configure Archival Rules</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <TableIcon className="h-3 w-3" />
                <span>{selectedTable}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-bold">Dependency-Aware Extraction</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card className="lg:col-span-8 bg-white border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-lg font-bold">Selection Criteria</CardTitle>
              <p className="text-sm text-slate-400">Define the WHERE clause for extraction while maintaining referential integrity.</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-900">Referential Integrity Check</span>
                    <span className="text-[10px] font-medium text-blue-600">Prevent orphan records by resolving child table dependencies.</span>
                  </div>
                </div>
                <Switch 
                  checked={maintainIntegrity} 
                  onCheckedChange={setMaintainIntegrity}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 mb-2">
                  <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Column Name</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase">Operator</div>
                  <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase">Criteria Value</div>
                  <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase">Logic</div>
                  <div className="col-span-1 text-[10px] font-bold text-slate-400 uppercase text-right">Action</div>
                </div>

                {queryRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <Select value={row.column} onValueChange={(v) => updateRow(row.id, 'column', v)}>
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50/50">
                          <SelectValue placeholder="Column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">created_at</SelectItem>
                          <SelectItem value="status">status</SelectItem>
                          <SelectItem value="id">id</SelectItem>
                          <SelectItem value="transaction_type">transaction_type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Select value={row.operator} onValueChange={(v) => updateRow(row.id, 'operator', v)}>
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50/50">
                          <SelectValue placeholder="Op" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value="!=">!=</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value="<=">{'<='}</SelectItem>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value=">=">{'>='}</SelectItem>
                          <SelectItem value="LIKE">LIKE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4">
                      <Input 
                        placeholder="Value" 
                        value={row.value || ""}
                        onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                        className="h-11 border-slate-200 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select value={row.logic} onValueChange={(v) => updateRow(row.id, 'logic', v)}>
                        <SelectTrigger className="h-11 border-slate-200 rounded-xl bg-slate-50/50">
                          <SelectValue placeholder="Logic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQueryRow(row.id)}
                        className="h-10 w-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  onClick={addQueryRow}
                  className="mt-4 border-dashed border-2 border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-slate-50 w-full h-12 rounded-xl font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-slate-50 flex items-center justify-end border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-11 px-8 rounded-xl font-bold bg-white" onClick={() => setView('task-details')}>
                  Cancel
                </Button>
                <Button className="h-11 px-10 rounded-xl font-bold bg-primary text-white shadow-lg hover:shadow-primary/20 transition-all">
                  Save Extraction Plan
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden p-8">
              <div className="flex items-center gap-2 mb-6">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-slate-900">Query Preview</h3>
              </div>
              <div className="relative rounded-2xl bg-[#0F172A] p-6 font-mono text-sm leading-relaxed overflow-hidden min-h-[160px]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <pre className="text-slate-300 whitespace-pre-wrap break-all">
                  <span className="text-blue-400 uppercase">SELECT</span> * <span className="text-blue-400 uppercase">FROM</span> <span className="text-emerald-400">{selectedTable}</span>{"\n"}
                  {queryRows.length > 0 && (
                    <>
                      <span className="text-blue-400 uppercase">WHERE</span>{" "}
                      {queryRows.map((row, idx) => (
                        <React.Fragment key={row.id}>
                          {idx > 0 && (
                            <>{"\n"}<span className="text-blue-400 uppercase">{row.logic}</span> </>
                          )}
                          <span className="text-emerald-400">{row.column}</span> {row.operator} <span className="text-amber-400">'{row.value || '?'}'</span>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {maintainIntegrity && "\n\n/* Dependency Resolution Enabled */"}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'task-details' && selectedTask) {
    const isArchiving = selectedTask.type === 'Archiving' || selectedTask.actions?.includes('Archiving');
    const isIndexRebuild = selectedTask.type === 'Index Rebuild' || selectedTask.actions?.includes('Index Rebuild');

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedTask.name}</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Database className="h-3 w-3" />
                <span>{selectedTask.database}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-bold">Configure Task Components</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-12 px-8 text-[10px] font-bold uppercase text-slate-400">Table Name</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Status Info</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Deadlocks</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Slow Qs</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Size</TableHead>
                {isIndexRebuild && <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Index Strategy</TableHead>}
                {isArchiving && <TableHead className="h-12 px-8 text-right text-[10px] font-bold uppercase text-slate-400">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedTask.tables.map((tableName) => (
                <TableRow key={tableName} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                  <TableCell className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                        <TableIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{tableName}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Monitored Resource</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tableName.includes('UPLOAD') || tableName.includes('AUDIT') ? (
                      <Badge className="bg-rose-50 text-rose-500 border-none font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <ShieldAlert className="h-3 w-3" />
                        Frag High
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" />
                        Stable
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                      <Activity className="h-3 w-3" />
                      {Math.floor(Math.random() * 5)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                      <Zap className="h-3 w-3" />
                      {Math.floor(Math.random() * 10)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-600">
                      {tableName.includes('BYTES') || tableName.includes('UPLOAD') ? '45.0 GB' : '8.1 GB'}
                    </span>
                  </TableCell>
                  {isIndexRebuild && (
                    <TableCell>
                      <Select defaultValue="rebuild">
                        <SelectTrigger className="h-9 w-32 border-slate-200 bg-white text-[11px] font-bold rounded-lg shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rebuild">Rebuild</SelectItem>
                          <SelectItem value="reorganize">Re-organize</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  {isArchiving && (
                    <TableCell className="px-8 text-right">
                      <Button 
                        variant="link"
                        onClick={() => handleConfigureQuery(tableName)}
                        className="h-10 px-6 text-primary hover:no-underline text-[11px] font-bold rounded-xl gap-2"
                      >
                        <Settings2 className="h-4 w-4" />
                        Configure Query
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.database.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "Multi-Task") {
      const isPrimaryType = ['Archiving', 'Index Rebuild', 'Update Stats', 'Scanning'].includes(t.type);
      return matchesSearch && (!isPrimaryType || t.type === 'Multi-Task');
    }
    
    return matchesSearch && t.type === activeTab;
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
          <Badge className="bg-[#E6F4EA] text-[#1E8E3E] hover:bg-[#E6F4EA] border-none font-medium px-2 py-0.5 text-[10px]">
            {tasks.length} Active Tasks
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search tasks..." 
              className="h-9 text-xs pl-8 w-64 bg-white border-slate-200 rounded-lg shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="Archiving" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/80 p-1 h-12 rounded-xl mb-6 flex justify-start w-full overflow-x-auto no-scrollbar">
          <TabsTrigger value="Archiving" className="rounded-lg px-6 font-bold text-xs gap-2">
            <Archive className="h-3.5 w-3.5 text-amber-500" /> Archiving
          </TabsTrigger>
          <TabsTrigger value="Index Rebuild" className="rounded-lg px-6 font-bold text-xs gap-2">
            <Zap className="h-3.5 w-3.5 text-blue-500" /> Indexing
          </TabsTrigger>
          <TabsTrigger value="Update Stats" className="rounded-lg px-6 font-bold text-xs gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-500" /> Stats
          </TabsTrigger>
          <TabsTrigger value="Scanning" className="rounded-lg px-6 font-bold text-xs gap-2">
            <SearchIcon className="h-3.5 w-3.5 text-purple-500" /> Scanning
          </TabsTrigger>
          <TabsTrigger value="Multi-Task" className="rounded-lg px-6 font-bold text-xs gap-2">
            <LayoutGrid className="h-3.5 w-3.5 text-slate-600" /> Others
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const isConfigurable = task.type === 'Archiving' || 
                                    task.type === 'Index Rebuild' || 
                                    (task.type === 'Multi-Task' && (task.actions?.includes('Archiving') || task.actions?.includes('Index Rebuild')));
              
              return (
                <Card key={task.id} className="bg-white border-none shadow-sm rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-base font-bold text-slate-900 truncate max-w-[200px]">{task.name}</CardTitle>
                        <Badge className="bg-slate-100 text-slate-400 border-none font-bold text-[8px] uppercase">{task.type}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-full hover:bg-slate-50">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                          <DropdownMenuItem onClick={() => handleViewExecution(task)} className="gap-2 py-2 cursor-pointer font-medium text-xs">
                            <Play className="h-3.5 w-3.5 text-emerald-600" />
                            View Execution
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                          <Server className="h-2.5 w-2.5" /> Server
                        </span>
                        <div className="text-xs font-bold text-slate-700 truncate">{task.server}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                          <Database className="h-2.5 w-2.5" /> DB
                        </span>
                        <div className="text-xs font-bold text-slate-700 truncate">{task.database}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <TableIcon className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Scope</span>
                        <span className="text-xs font-bold text-slate-900">{task.tables.length} Monitored Tables</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Last Modified</div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-primary" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-slate-50/50 border-t border-slate-100 gap-2">
                    {isConfigurable && (
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 text-[11px] font-bold rounded-xl gap-2 bg-white"
                        onClick={() => handleTaskClick(task)}
                      >
                        <Settings2 className="h-4 w-4" /> Configure
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      className="flex-1 h-10 text-[11px] font-bold rounded-xl gap-2 bg-white"
                      onClick={(e) => openScheduleDialog(e, task)}
                    >
                      <Clock className="h-4 w-4" /> Schedule
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Maintenance
            </DialogTitle>
            <DialogDescription>
              Configure the execution frequency for "{taskToSchedule?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Frequency</Label>
              <Select 
                value={scheduleForm.frequency} 
                onValueChange={(v: any) => setScheduleForm(prev => ({ ...prev, frequency: v }))}
              >
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">Start Date</Label>
                <Input 
                  type="date" 
                  value={scheduleForm.startDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">End Date</Label>
                <Input 
                  type="date" 
                  value={scheduleForm.endDate}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleFinalizeSchedule} className="bg-primary hover:bg-primary/90 text-white font-bold">
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

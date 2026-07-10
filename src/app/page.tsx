
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { RedundancyScanner } from "@/components/redundancy-scanner"
import { MaintenancePlanner } from "@/components/maintenance-planner"
import { TableManager } from "@/components/table-manager"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { ArchiveManager } from "@/components/archive-manager"
import { ReportsManager } from "@/components/reports-manager"
import { AlertsManager } from "@/components/alerts-manager"
import { ConfigureTablesView } from "@/components/configure-tables-view"
import { ConfigureAlertsView } from "@/components/configure-alerts-view"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export type ScheduleConfig = {
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  daysOfWeek?: string[]
  dayOfMonth?: number
  startDate: string
  endDate: string
}

export type MaintenanceAction = 
  | 'Archiving'
  | 'Index Rebuild'
  | 'Update Stats'
  | 'Scanning'

export type MaintenanceTask = {
  id: string
  name: string
  type: MaintenanceAction
  jobCategory?: string
  server: string
  database: string
  tables: string[]
  createdAt: string
  status?: 'pending' | 'scheduled'
  schedule?: ScheduleConfig
  targetDatabase?: string
}

export type DatabaseInstance = {
  name: string
  server: string
  status: string
  statusVariant: "warning" | "critical" | "healthy"
  metrics: { label: string; value: string; color?: string }[]
  footer: string
  isActive: boolean
  monitoredTables: string[]
}

const DEFAULT_MONITORED = [
  "WEB_AUTH_DETAILS",
  "WEB_AUDIT_TRAIL",
  "PROV_CONSULT_NOTES",
  "USERS",
  "POST_DISMISSALS"
]

const DEFAULT_DATABASES: DatabaseInstance[] = [
  {
    name: "WebPortalDB",
    server: "SQLSRV-PROD-01 · port 1433",
    status: "Warning",
    statusVariant: "warning",
    monitoredTables: [...DEFAULT_MONITORED],
    metrics: [
      { label: "Size", value: "842 GB" },
      { label: "Tables", value: "5" },
      { label: "Avg frag", value: "24.3%", color: "text-amber-600" },
      { label: "Cache hit", value: "91.4%", color: "text-emerald-600" },
      { label: "Deadlocks", value: "7", color: "text-rose-600" },
    ],
    footer: "3 tables above 30% fragmentation · 1 redundant table detected",
    isActive: true
  },
  {
    name: "ReportingDB",
    server: "SQLSRV-PROD-01 · port 1433",
    status: "Critical",
    statusVariant: "critical",
    monitoredTables: ["Auth_Consult_Notes", "REQUEST_LOG"],
    metrics: [
      { label: "Size", value: "210 GB" },
      { label: "Tables", value: "2" },
      { label: "Avg frag", value: "41%", color: "text-rose-600" },
      { label: "Cache hit", value: "78%", color: "text-rose-600" },
      { label: "Deadlocks", value: "2", color: "text-slate-900" },
    ],
    footer: "5 tables critical · cache hit below 80% threshold",
    isActive: false
  }
]

const DEFAULT_TASKS: MaintenanceTask[] = [
  {
    id: "task-1",
    name: "Q4 Data Cleanup",
    type: "Archiving",
    jobCategory: "ARCHIVE_JOB",
    server: "SQLSRV-PROD-01",
    database: "WebPortalDB",
    tables: ["WEB_FILE_UPLOAD_2009", "WEB_FILE_BYTES_2009"],
    createdAt: "2024-03-10T14:30:00Z",
    status: 'pending',
    targetDatabase: "ReportingDB"
  },
  {
    id: "task-2",
    name: "Monthly Index Tuning",
    type: "Index Rebuild",
    jobCategory: "INDEX_REBUILD",
    server: "SQLSRV-PROD-01",
    database: "WebPortalDB",
    tables: ["WEB_AUTH_DETAILS", "WEB_AUTH_NOTES"],
    createdAt: "2024-03-08T09:15:00Z",
    status: 'pending'
  },
  {
    id: "task-3",
    name: "Daily Stats Refresh",
    type: "Update Stats",
    jobCategory: "STATISTICS_UPDATE",
    server: "SQLSRV-PROD-01",
    database: "WebPortalDB",
    tables: ["USERS", "USER_PROVIDERS"],
    createdAt: "2024-03-01T08:00:00Z",
    status: 'scheduled',
    schedule: {
      frequency: 'Daily',
      startDate: '2024-03-01',
      endDate: '2024-12-31'
    }
  }
]

export default function SQLSentinelApp() {
  const [currentView, setCurrentView] = React.useState("overview")
  const [activeDbName, setActiveDbName] = React.useState("WebPortalDB")
  const [databases, setDatabases] = React.useState<DatabaseInstance[]>(DEFAULT_DATABASES)
  const [tasks, setTasks] = React.useState<MaintenanceTask[]>(DEFAULT_TASKS)
  const [activeTaskTab, setActiveTaskTab] = React.useState("Archiving")
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    const savedView = localStorage.getItem("sql_sentinel_currentView")
    const savedDb = localStorage.getItem("sql_sentinel_activeDbName")
    const savedDatabases = localStorage.getItem("sql_sentinel_databases")
    const savedTasks = localStorage.getItem("sql_sentinel_tasks")
    const savedTaskTab = localStorage.getItem("sql_sentinel_activeTaskTab")

    if (savedView) setCurrentView(savedView)
    if (savedDb) setActiveDbName(savedDb)
    if (savedDatabases) setDatabases(JSON.parse(savedDatabases))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedTaskTab) setActiveTaskTab(savedTaskTab)
    
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sql_sentinel_currentView", currentView)
      localStorage.setItem("sql_sentinel_activeDbName", activeDbName)
      localStorage.setItem("sql_sentinel_databases", JSON.stringify(databases))
      localStorage.setItem("sql_sentinel_tasks", JSON.stringify(tasks))
      localStorage.setItem("sql_sentinel_activeTaskTab", activeTaskTab)
    }
  }, [currentView, activeDbName, databases, tasks, activeTaskTab, isMounted])

  const handleAddDatabase = (dbName: string, serverName: string) => {
    const newDb: DatabaseInstance = {
      name: dbName || "New_Connection",
      server: `${serverName || "Localhost"} · port 1433`,
      status: "Healthy",
      statusVariant: "healthy",
      monitoredTables: [],
      metrics: [
        { label: "Size", value: "0 GB" },
        { label: "Tables", value: "0" },
        { label: "Avg frag", value: "0%", color: "text-emerald-600" },
        { label: "Cache hit", value: "100%", color: "text-emerald-600" },
        { label: "Deadlocks", value: "0", color: "text-slate-900" },
      ],
      footer: "Initial scan in progress · No issues found",
      isActive: false
    }
    setDatabases(prev => [newDb, ...prev])
    setActiveDbName(newDb.name)
  }

  const handleUpdateDatabaseTables = (dbName: string, tables: string[]) => {
    setDatabases(prev => prev.map(db => {
      if (db.name === dbName) {
        return {
          ...db,
          monitoredTables: tables,
          metrics: db.metrics.map(m => m.label === "Tables" ? { ...m, value: tables.length.toString() } : m)
        }
      }
      return db
    }))
  }

  const handleCreateTask = (task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    setTasks(prev => [newTask, ...prev])
    
    let targetTab = task.type === 'Archiving' ? 'Archiving' :
                    task.type === 'Index Rebuild' ? 'Index Rebuild' :
                    task.type === 'Update Stats' ? 'Update Stats' : 'Scanning'
    
    setActiveTaskTab(targetTab)
    setCurrentView("archive")
  }

  const handleUpdateTask = (taskId: string, updates: Partial<MaintenanceTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    toast({
      title: "Task Deleted",
      description: "The maintenance task has been removed.",
    })
  }

  const renderContent = () => {
    const activeDb = databases.find(db => db.name === activeDbName)
    const serverName = activeDb?.server.split(' · ')[0] || "Unknown Server"

    switch (currentView) {
      case "overview":
        return (
          <DashboardOverview 
            databases={databases} 
            onAddDatabase={handleAddDatabase} 
            onViewChange={setCurrentView}
            onDbChange={setActiveDbName}
          />
        )
      case "config-tables":
        return (
          <ConfigureTablesView 
            databaseName={activeDbName} 
            initialSelectedTables={activeDb?.monitoredTables || []}
            onBack={() => setCurrentView("overview")}
            onSave={(tables) => {
              handleUpdateDatabaseTables(activeDbName, tables);
              setCurrentView("overview");
            }}
          />
        )
      case "config-alerts":
        return (
          <ConfigureAlertsView 
            databaseName={activeDbName} 
            onBack={() => setCurrentView("overview")}
            onSave={() => setCurrentView("overview")}
          />
        )
      case "table-manager":
        return (
          <TableManager 
            activeDb={activeDbName} 
            serverName={serverName} 
            monitoredTables={activeDb?.monitoredTables || []}
            databases={databases}
            onCreateTask={handleCreateTask} 
          />
        )
      case "performance":
        return (
          <PerformanceMonitor 
            activeDb={activeDbName} 
            monitoredTables={activeDb?.monitoredTables || []} 
          />
        )
      case "redundancy":
        return (
          <RedundancyScanner 
            activeDb={activeDbName} 
            serverName={serverName}
            databases={databases}
            onCreateTask={handleCreateTask} 
          />
        )
      case "maintenance":
        return <MaintenancePlanner tasks={tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
      case "archive":
        return <ArchiveManager tasks={tasks} onUpdateTask={handleUpdateTask} onViewChange={setCurrentView} initialTab={activeTaskTab} />
      case "export":
        return <ReportsManager activeDb={activeDbName} />
      case "alerts":
        return <AlertsManager activeDb={activeDbName} />
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-12">
            <h2 className="text-2xl font-bold text-slate-300">Feature Under Development</h2>
            <p className="text-slate-400 mt-2">The {currentView} interface is currently being integrated for {activeDbName}.</p>
            <Button variant="link" onClick={() => setCurrentView("overview")} className="mt-4 text-primary">Return to Dashboard</Button>
          </div>
        )
    }
  }

  if (!isMounted) return null

  return (
    <SidebarProvider>
      <AppSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        activeDb={activeDbName}
        onDbChange={setActiveDbName}
        databases={databases.map(db => db.name)}
      />
      <SidebarInset className="bg-background flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-slate-400 hover:text-slate-600 h-8 w-8" />
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Instance:</span>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">PROD-SQL-01</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end max-w-4xl">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search logs, queries, tables..."
                className="pl-10 bg-[#F8F9FA] border-slate-200 h-10 text-xs rounded-full focus-visible:ring-1 shadow-none w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="relative h-10 w-10 rounded-full border-2 border-[#E6F4EA] bg-white hover:bg-[#F1F9F3] transition-all group"
              >
                <Bell className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </Button>
              <Avatar className="h-10 w-10 rounded-full border-2 border-slate-100 shadow-sm">
                <AvatarImage src="https://picsum.photos/seed/user-main/40/40" />
                <AvatarFallback className="text-[10px] font-bold bg-emerald-50 text-emerald-700">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 overflow-auto bg-background">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
        
        <footer className="py-6 px-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-background">
          &copy; 2026 MPM Database Health • developed by keysoftware Team
        </footer>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

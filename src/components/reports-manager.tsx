
"use client"

import * as React from "react"
import { 
  FileText, 
  Download, 
  Database,
  RefreshCw,
  FileSpreadsheet,
  History,
  ShieldCheck,
  BarChart3,
  Archive,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  FileType,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { cn } from "@/lib/utils"

type ReportType = 'health' | 'stats' | 'archival' | 'maintenance' | 'history'
type ExportFormat = 'excel' | 'pdf' | 'csv'

export function ReportsManager({ activeDb }: { activeDb: string }) {
  const [selectedDb, setSelectedDb] = React.useState(activeDb)
  const [reportType, setReportType] = React.useState<ReportType>('health')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const { toast } = useToast()

  const MOCK_DATA = {
    health: [
      { metric: "Cache Hit Ratio", value: "91.4%", status: "Warning", description: "Target >95%" },
      { metric: "Index Fragmentation", value: "24.3% Avg", status: "Healthy", description: "Standard threshold <30%" },
      { metric: "Active Deadlocks", value: "7 (24h)", status: "Critical", description: "Spike detected in Auth logs" },
      { metric: "Slow Queries", value: "243 (24h)", status: "Warning", description: "Threshold >1.0s" },
    ],
    stats: [
      { table: "WEB_AUTH_NOTES", schema: "auth", rows: "31.6M", size: "88.4 GB", frag: "68%" },
      { table: "WEB_AUDIT_TRAIL", schema: "audit", rows: "58.5M", size: "142 GB", frag: "62%" },
      { table: "PROV_CONSULT_NOTES", schema: "dbo", rows: "5.5M", size: "12.4 GB", frag: "52%" },
    ],
    archival: [
      { task: "Q4 Archive", tables: "WEB_FILE_UPLOAD", reclaimed: "45.2 GB", integrity: "Verified", date: "2024-03-10" },
      { task: "Legacy Cleanup", tables: "SESSION_LOGS", reclaimed: "12.8 GB", integrity: "Verified", date: "2024-03-05" },
    ],
    maintenance: [
      { operation: "Index Rebuild", target: "WEB_AUTH_DETAILS", result: "Success", duration: "12m", time: "2h ago" },
      { operation: "Stats Refresh", target: "USERS", result: "Success", duration: "1m", time: "4h ago" },
    ],
    history: [
      { job: "Nightly Scan", db: "WebPortalDB", status: "Completed", dur: "1h 14m", time: "02:00 AM" },
      { job: "Batch Archive", db: "WebPortalDB", status: "Completed", dur: "45m", time: "04:15 AM" },
    ]
  }

  const handleExport = (format: ExportFormat) => {
    setIsGenerating(true)
    const data = MOCK_DATA[reportType]
    const fileName = `${selectedDb}_${reportType}_report_${new Date().toISOString().split('T')[0]}`

    setTimeout(() => {
      try {
        if (format === 'csv') {
          const headers = Object.keys(data[0]).join(",")
          const csvContent = headers + "\n" + data.map((e: any) => Object.values(e).join(",")).join("\n")
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.setAttribute("href", url)
          link.setAttribute("download", `${fileName}.csv`)
          link.click()
        } else if (format === 'excel') {
          const worksheet = XLSX.utils.json_to_sheet(data)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, reportType.toUpperCase())
          XLSX.writeFile(workbook, `${fileName}.xlsx`)
        } else if (format === 'pdf') {
          const doc = new jsPDF()
          doc.text(`${selectedDb} - ${reportType.toUpperCase()} REPORT`, 14, 22)
          autoTable(doc, {
            head: [Object.keys(data[0]).map(h => h.toUpperCase())],
            body: data.map(obj => Object.values(obj)),
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [30, 142, 62] },
          })
          doc.save(`${fileName}.pdf`)
        }

        toast({
          title: "Report Exported",
          description: `Report saved as ${format.toUpperCase()}.`,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: "An error occurred while generating your report.",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 1500)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          Reporting & Audit Center
        </h1>
        <p className="text-sm text-slate-400 font-medium">Operational monitoring, troubleshooting, and compliance tracking center.</p>
      </div>

      <Tabs defaultValue="health" value={reportType} onValueChange={(v) => setReportType(v as ReportType)} className="w-full">
        <TabsList className="bg-slate-100 p-1 h-12 rounded-xl mb-6">
          <TabsTrigger value="health" className="rounded-lg px-6 font-bold text-xs gap-2">
            <ShieldCheck className="h-4 w-4" /> Health Audit
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg px-6 font-bold text-xs gap-2">
            <BarChart3 className="h-4 w-4" /> Table Statistics
          </TabsTrigger>
          <TabsTrigger value="archival" className="rounded-lg px-6 font-bold text-xs gap-2">
            <Archive className="h-4 w-4" /> Archival Summary
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-lg px-6 font-bold text-xs gap-2">
            <History className="h-4 w-4" /> Maintenance
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 font-bold text-xs gap-2">
            <Activity className="h-4 w-4" /> Execution History
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Export Options</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2">
                    {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Generate & Export
                    <ChevronDown className="h-3 w-3 ml-auto opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl p-2" align="end">
                  <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 py-3 rounded-lg cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 py-3 rounded-lg cursor-pointer">
                    <FileType className="h-4 w-4 text-rose-600" /> PDF (.pdf)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 py-3 rounded-lg cursor-pointer">
                    <FileText className="h-4 w-4 text-slate-600" /> CSV (.csv)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="bg-white border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b bg-slate-50/30">
                <CardTitle className="text-lg font-bold capitalize">{reportType} Preview</CardTitle>
                <CardDescription>Generated for {selectedDb}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      {Object.keys(MOCK_DATA[reportType][0]).map(header => (
                        <TableHead key={header} className="px-8 text-[10px] font-bold uppercase">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DATA[reportType].map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                        {Object.values(row).map((val: any, j: number) => (
                          <TableCell key={j} className={cn("px-8 py-4 text-xs font-bold", j === 0 ? "text-slate-700" : "text-slate-500")}>
                            {val}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

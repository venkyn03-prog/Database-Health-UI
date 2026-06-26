
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
  AlertCircle
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

type ReportType = 'health' | 'stats' | 'archival' | 'maintenance'

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
    ],
    stats: [
      { table: "WEB_AUTH_NOTES", schema: "auth", rows: "31.6M", size: "88.4 GB", growth: "+1.2%" },
      { table: "WEB_AUDIT_TRAIL", schema: "audit", rows: "58.5M", size: "142 GB", growth: "+2.8%" },
      { table: "USERS", schema: "auth", rows: "154K", size: "45 MB", growth: "+0.1%" },
    ],
    archival: [
      { task: "Q4 Archive", tables: "WEB_FILE_UPLOAD", reclaimed: "45.2 GB", date: "2024-03-10" },
      { task: "Legacy Cleanup", tables: "SESSION_LOGS", reclaimed: "12.8 GB", date: "2024-03-05" },
    ],
    maintenance: [
      { operation: "Index Rebuild", target: "WEB_AUTH_DETAILS", result: "Success", duration: "12m", time: "2h ago" },
      { operation: "Stats Refresh", target: "USERS", result: "Success", duration: "1m", time: "4h ago" },
      { operation: "Archive Run", target: "AUDIT_TRAIL", result: "Failed", duration: "45m", time: "Yesterday" },
    ]
  }

  const handleExport = () => {
    setIsGenerating(true)
    setTimeout(() => {
      let csvContent = ""
      const data = MOCK_DATA[reportType]
      
      if (reportType === 'health') {
        csvContent = "Metric,Value,Status,Description\n" + data.map((e: any) => `${e.metric},${e.value},${e.status},${e.description}`).join("\n")
      } else if (reportType === 'stats') {
        csvContent = "Table,Schema,Rows,Size,Growth\n" + data.map((e: any) => `${e.table},${e.schema},${e.rows},${e.size},${e.growth}`).join("\n")
      } else {
        csvContent = "Key,Details,Status,Time\n" + data.map((e: any) => Object.values(e).join(",")).join("\n")
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${selectedDb}_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsGenerating(false)
      toast({
        title: "Report Exported",
        description: `Comprehensive ${reportType} report for ${selectedDb} downloaded.`,
      })
    }, 1500)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          Reporting & Audit Center
        </h1>
        <p className="text-sm text-slate-400 font-medium">Detailed database statistics, health reports, and maintenance logs for operational monitoring.</p>
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
            <History className="h-4 w-4" /> Maintenance Logs
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Report Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Instance</label>
                  <Select value={selectedDb} onValueChange={setSelectedDb}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WebPortalDB">WebPortalDB</SelectItem>
                      <SelectItem value="ReportingDB">ReportingDB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleExport} 
                    disabled={isGenerating} 
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/10 gap-2"
                  >
                    {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Export to CSV
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-[#F0FDF4] border-none shadow-sm rounded-2xl p-6">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <ShieldCheck className="h-4 w-4" />
                <h4 className="text-xs font-bold uppercase">Compliance Ready</h4>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium leading-relaxed">
                Reports generated here meet standard auditing requirements for database operational logs and performance tracking.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="bg-white border-none shadow-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold capitalize">{reportType} Preview</CardTitle>
                    <CardDescription className="text-xs font-medium">Real-time data snapshot from {selectedDb}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white border-slate-200">Generated: Just Now</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      {reportType === 'health' && (
                        <>
                          <TableHead className="px-8 text-[10px] font-bold uppercase">Metric</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Value</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Status</TableHead>
                          <TableHead className="px-8 text-[10px] font-bold uppercase text-right">Context</TableHead>
                        </>
                      )}
                      {reportType === 'stats' && (
                        <>
                          <TableHead className="px-8 text-[10px] font-bold uppercase">Table</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Schema</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Rows</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Size</TableHead>
                          <TableHead className="px-8 text-[10px] font-bold uppercase text-right">Growth</TableHead>
                        </>
                      )}
                      {reportType === 'archival' && (
                        <>
                          <TableHead className="px-8 text-[10px] font-bold uppercase">Task</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Tables</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Reclaimed</TableHead>
                          <TableHead className="px-8 text-[10px] font-bold uppercase text-right">Date</TableHead>
                        </>
                      )}
                      {reportType === 'maintenance' && (
                        <>
                          <TableHead className="px-8 text-[10px] font-bold uppercase">Operation</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Target</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Result</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase">Dur.</TableHead>
                          <TableHead className="px-8 text-[10px] font-bold uppercase text-right">Time</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DATA[reportType].map((row: any, i: number) => (
                      <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b last:border-0">
                        {reportType === 'health' && (
                          <>
                            <TableCell className="px-8 py-4 font-bold text-slate-700">{row.metric}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">{row.value}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[9px] font-bold uppercase border-none",
                                row.status === 'Healthy' ? "bg-emerald-50 text-emerald-600" :
                                row.status === 'Warning' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                              )}>{row.status}</Badge>
                            </TableCell>
                            <TableCell className="px-8 py-4 text-right text-[10px] font-medium text-slate-400">{row.description}</TableCell>
                          </>
                        )}
                        {reportType === 'stats' && (
                          <>
                            <TableCell className="px-8 py-4 font-bold text-slate-700">{row.table}</TableCell>
                            <TableCell className="text-[10px] uppercase font-bold text-slate-400">{row.schema}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">{row.rows}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-900">{row.size}</TableCell>
                            <TableCell className="px-8 py-4 text-right text-xs font-bold text-emerald-600">{row.growth}</TableCell>
                          </>
                        )}
                        {reportType === 'archival' && (
                          <>
                            <TableCell className="px-8 py-4 font-bold text-slate-700">{row.task}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{row.tables}</TableCell>
                            <TableCell className="text-xs font-bold text-emerald-600">{row.reclaimed}</TableCell>
                            <TableCell className="px-8 py-4 text-right text-xs font-bold text-slate-400">{row.date}</TableCell>
                          </>
                        )}
                        {reportType === 'maintenance' && (
                          <>
                            <TableCell className="px-8 py-4 font-bold text-slate-700">{row.operation}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{row.target}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {row.result === 'Success' ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <AlertCircle className="h-3 w-3 text-rose-500" />}
                                <span className="text-xs font-bold text-slate-700">{row.result}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-400">{row.duration}</TableCell>
                            <TableCell className="px-8 py-4 text-right text-xs font-bold text-slate-400">{row.time}</TableCell>
                          </>
                        )}
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
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

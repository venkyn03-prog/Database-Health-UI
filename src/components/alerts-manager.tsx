
"use client"

import * as React from "react"
import { 
  Bell, 
  RefreshCw,
  Database,
  History,
  ShieldCheck,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const EVENT_LOG = [
  { id: 'e1', event: 'Maintenance Triggered', type: 'System', details: 'Full Backup started on WebPortalDB', time: '12m ago', status: 'Success' },
  { id: 'e2', event: 'Policy Violation', type: 'Security', details: 'Unauthorized DDL attempt on USERS table', time: '1h 14m ago', status: 'Blocked' },
  { id: 'e3', event: 'Threshold Alert', type: 'Performance', details: 'Fragmentation reached 42% on WEB_AUTH', time: '3h 22m ago', status: 'Notified' },
  { id: 'e4', event: 'Manual Archive', type: 'User: admin', details: 'Archived 12GB from RequestLog', time: 'Yesterday', status: 'Success' },
]

export function AlertsManager({ activeDb }: { activeDb: string }) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Audit Sync",
        description: "Event logs synchronized for compliance review.",
      })
    }, 1500)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <History className="h-7 w-7 text-primary" />
              Audit & Event Logs
            </h1>
            <Badge className="bg-[#E6F4EA] text-[#1E8E3E] hover:bg-[#E6F4EA] border-none font-medium px-2 py-0.5 text-[10px]">
              {activeDb}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 font-medium">Compliance auditing and system event tracking for {activeDb}.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 border-slate-200 bg-white rounded-xl px-4 font-bold text-slate-600 gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#F8F9FA] border-none p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">System Integrity</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">Verified</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Last scan completed 08:42 AM</p>
        </Card>
        <Card className="bg-[#F8F9FA] border-none p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-amber-600" />
            <span className="text-xs font-bold text-slate-700 uppercase">Open Alerts</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">3 Active</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Requires administrative review</p>
        </Card>
        <Card className="bg-[#F8F9FA] border-none p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-slate-700 uppercase">Export Reports</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">12 Logs</div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Available for export today</p>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">System Audit Trail</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-tight">Traceable activity log for {activeDb}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-8 text-[10px] font-bold uppercase text-slate-400">Event</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Type</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Details</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Result</TableHead>
                <TableHead className="h-12 px-8 text-right text-[10px] font-bold uppercase text-slate-400">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EVENT_LOG.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/30 border-b last:border-0">
                  <TableCell className="py-4 px-8">
                    <span className="text-xs font-bold text-slate-700">{log.event}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-400">{log.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-500">{log.details}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[9px] font-bold uppercase border-none",
                      log.status === 'Success' ? "bg-emerald-50 text-emerald-600" :
                      log.status === 'Blocked' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    )}>{log.status}</Badge>
                  </TableCell>
                  <TableCell className="px-8 text-right text-[10px] font-bold text-slate-400 uppercase">
                    {log.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import * as React from "react"
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  Clock, 
  ShieldAlert, 
  Info,
  Database,
  ArrowUpRight,
  History,
  CheckCircle2,
  FileCode,
  Archive
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { TableData } from "./table-manager"
import { cn } from "@/lib/utils"

const CHART_DATA = [
  { month: 'Jan', size: 180 },
  { month: 'Feb', size: 195 },
  { month: 'Mar', size: 210 },
  { month: 'Apr', size: 225 },
  { month: 'May', size: 235 },
  { month: 'Jun', size: 245.8 },
]

const MOCK_ARCHIVE_HISTORY = [
  { id: '1', date: '2024-03-10', rows: '1,240,500', reclaimed: '45.2 GB', status: 'Verified', tillDate: '2023-12-31' },
  { id: '2', date: '2024-02-05', rows: '890,200', reclaimed: '12.4 GB', status: 'Verified', tillDate: '2023-10-15' },
  { id: '3', date: '2023-12-12', rows: '2,100,500', reclaimed: '88.1 GB', status: 'Verified', tillDate: '2023-08-01' },
]

export function TableDetailsView({ table }: { table: TableData }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-sm rounded-2xl p-6 flex flex-col justify-between min-h-[140px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Database className="h-3 w-3" /> Table Size
            </div>
            <div className="text-3xl font-bold text-slate-900">{table.size}</div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Snapshot as of today 08:42 AM
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-2xl p-6 flex flex-col justify-between min-h-[140px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Activity className="h-3 w-3" /> Deadlocks (30d)
            </div>
            <div className="text-3xl font-bold text-slate-900">{table.deadlocks}</div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Last seen {table.lastRead}
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-2xl p-6 flex flex-col justify-between min-h-[140px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Zap className="h-3 w-3" /> Fragmentation
            </div>
            <div className="text-3xl font-bold text-amber-500">{table.fragmentation}%</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span>High priority rebuild</span>
          </div>
        </Card>

        <Card className="bg-[#0F172A] border-none shadow-xl rounded-2xl p-6 flex flex-col justify-between min-h-[140px]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Info className="h-3 w-3" /> Usage Frequency
            </div>
            <div className="text-2xl font-bold text-white">Low Usage</div>
            <div className="text-[9px] font-medium text-slate-400 italic">
              last two scans - this table was accessed 2 times
            </div>
          </div>
          <div>
            <Badge className="bg-blue-900/40 text-blue-400 border-none px-3 py-1 text-[10px] font-bold rounded-full">
              Archival Recommended
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 bg-white border-none shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-xl font-bold">Storage Progression</CardTitle>
              </div>
              <CardDescription className="text-sm font-medium text-slate-400">
                Historical growth (GB) across last 6 data cycles.
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Archived Till</span>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-xs">{table.archivedTill}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                    domain={[0, 300]} 
                    ticks={[0, 50, 100, 150, 200, 250, 300]}
                    tickFormatter={(value) => `${value} GB`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }} 
                    formatter={(value) => [`${value} GB`, 'Table Size']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="size" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorSize)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-white border-none shadow-sm rounded-3xl p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <Archive className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Archival History</h3>
          </div>
          <div className="space-y-4 flex-1">
            {MOCK_ARCHIVE_HISTORY.map(job => (
              <div key={job.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">{job.date}</span>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-bold uppercase px-2 py-0.5">{job.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Rows</span>
                    <span className="text-slate-700 font-bold">{job.rows}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Till Date</span>
                    <span className="text-slate-700 font-bold">{job.tillDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-6 w-full h-11 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
            <FileCode className="h-4 w-4" />
            Export Archive Log
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-none shadow-sm rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6 text-rose-800">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Performance Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-900">[IX_Primary_Lock] Recommended</span>
                <Badge className="bg-rose-100 text-rose-700 border-none font-bold text-[8px] uppercase">Critical Impact</Badge>
              </div>
              <p className="text-[10px] leading-relaxed text-rose-700 font-medium italic">
                Missing non-clustered index detected on primary lookup field used in <strong>sp_AuthUserLogin</strong>.
              </p>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">Composite Index Recomm.</span>
                <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[8px] uppercase">Moderate Impact</Badge>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-700 font-medium italic">
                Recommended to improve archival query scans in <strong>sp_CleanupExpiredSessions</strong>.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Table Resource Analysis</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-800">Buffer Pool Usage</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Memory Footprint</div>
              </div>
              <div className="text-xs font-bold text-emerald-500">82.1 MB</div>
            </div>
            <div className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-800">Index Scan Ops</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Avg / 24h cycle</div>
              </div>
              <div className="text-xs font-bold text-amber-500">1,244</div>
            </div>
            <div className="flex items-center justify-between group cursor-pointer pb-0">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-800">Maintenance Window</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Last Rebuild</div>
              </div>
              <div className="text-xs font-bold text-slate-600">3d ago</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

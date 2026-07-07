
"use client"

import * as React from "react"
import { 
  CalendarDays, 
  Clock, 
  Plus, 
  Trash2,
  Table as TableIcon,
  Server,
  Database,
  RefreshCw,
  Zap,
  Calendar,
  Edit2,
  Search,
  LayoutGrid,
  AlertTriangle,
  History,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MaintenanceTask, ScheduleConfig } from "@/app/page"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const JOB_CATEGORIES = [
  'HEALTH_SCAN',
  'DATABASE_STATISTICS',
  'TABLE_STATISTICS',
  'PERFORMANCE_SCAN',
  'CACHE_STATISTICS',
  'FRAGMENTATION_SCAN',
  'DEADLOCK_COLLECTOR',
  'LOCK_WAIT_COLLECTOR',
  'BLOCKING_COLLECTOR',
  'SLOW_QUERY_COLLECTOR',
  'MISSING_INDEX_SCAN',
  'REDUNDANCY_SCAN',
  'ARCHIVE_JOB',
  'ARCHIVE_CLEANUP',
  'INDEX_REORGANIZE',
  'INDEX_REBUILD',
  'STATISTICS_UPDATE',
  'ALERT_PROCESSOR',
  'NOTIFICATION_JOB',
  'REPORT_GENERATION',
  'HISTORY_CLEANUP',
  'FULL_SCAN'
]

export function MaintenancePlanner({ 
  tasks, 
  onUpdateTask,
  onDeleteTask
}: { 
  tasks: MaintenanceTask[], 
  onUpdateTask: (id: string, updates: Partial<MaintenanceTask>) => void,
  onDeleteTask: (id: string) => void
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null)
  
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>("")
  const [jobName, setJobName] = React.useState("")
  const [jobCategory, setJobCategory] = React.useState<string>("")
  const [executionPattern, setExecutionPattern] = React.useState<'One-Time' | 'Recurring'>('Recurring')
  
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleConfig>({
    frequency: 'Daily',
    daysOfWeek: ['Monday'],
    dayOfMonth: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const scheduledTasks = tasks.filter(t => t.status === 'scheduled')
  const pendingTasks = tasks.filter(t => t.status !== 'scheduled')

  const handleFinalizeSchedule = () => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId)
      
      const today = new Date().toISOString().split('T')[0]
      if (scheduleForm.startDate < today) {
        toast({
          variant: "destructive",
          title: "Invalid Start Date",
          description: "Start date cannot be in the past."
        })
        return
      }

      onUpdateTask(selectedTaskId, {
        name: jobName || task?.name,
        jobCategory: jobCategory || task?.jobCategory,
        status: 'scheduled',
        schedule: executionPattern === 'One-Time' ? { ...scheduleForm, frequency: 'Daily', endDate: scheduleForm.startDate } : scheduleForm
      })
      
      setIsCreateModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedTaskId("")
      setJobName("")
      setJobCategory("")
      toast({
        title: isEditModalOpen ? "Schedule Updated" : "Schedule Created",
        description: `"${jobName || task?.name}" is now active.`
      })
    }
  }

  const openEditModal = (task: MaintenanceTask) => {
    setSelectedTaskId(task.id)
    setJobName(task.name)
    setJobCategory(task.jobCategory || "")
    if (task.schedule) {
      setScheduleForm(task.schedule)
      setExecutionPattern(task.schedule.startDate === task.schedule.endDate ? 'One-Time' : 'Recurring')
    }
    setIsEditModalOpen(true)
  }

  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete)
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const toggleDay = (day: string) => {
    setScheduleForm(prev => {
      const days = prev.daysOfWeek || []
      if (days.includes(day)) {
        return { ...prev, daysOfWeek: days.filter(d => d !== day) }
      } else {
        return { ...prev, daysOfWeek: [...days, day] }
      }
    })
  }

  const resetForm = () => {
    setScheduleForm({
      frequency: 'Daily',
      daysOfWeek: ['Monday'],
      dayOfMonth: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    setJobName("")
    setJobCategory("")
    setExecutionPattern('Recurring')
    setSelectedTaskId("")
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Scheduler
          </h1>
          <p className="text-slate-400 font-medium">
            Manage your automated maintenance plans for enterprise databases.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/10 transition-all gap-2">
          <Plus className="h-5 w-5" />
          Create New Schedule
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800">Active Maintenance Schedules</h2>
        </div>
        <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-12 px-8 text-[10px] font-bold uppercase text-slate-400">Job Name</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Category</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Pattern</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Frequency</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Server/DB</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Schedule Details</TableHead>
                <TableHead className="h-12 px-8 text-right text-[10px] font-bold uppercase text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Calendar className="h-12 w-12" />
                      <span className="text-sm font-bold uppercase tracking-widest">No Active Schedules</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                scheduledTasks.map((task) => {
                  const isRecurring = task.schedule?.startDate !== task.schedule?.endDate;
                  return (
                    <TableRow key={task.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border",
                            task.type === 'Archiving' ? "bg-amber-50 text-amber-500 border-amber-100" :
                            task.type === 'Index Rebuild' ? "bg-blue-50 text-blue-500 border-blue-100" :
                            "bg-emerald-50 text-emerald-500 border-emerald-100"
                          )}>
                            {task.type === 'Archiving' ? <TableIcon className="h-5 w-5" /> : 
                             task.type === 'Index Rebuild' ? <Zap className="h-5 w-5" /> : 
                             <RefreshCw className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{task.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {task.type}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase border-none bg-slate-50 text-slate-600">
                          {task.jobCategory || 'GENERAL'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-bold uppercase border-none",
                          isRecurring ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                        )}>
                          {isRecurring ? 'Recurring' : 'One-Time'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">
                          {isRecurring ? task.schedule?.frequency : 'Once'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <Server className="h-2.5 w-2.5" /> {task.server}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Database className="h-2.5 w-2.5" /> {task.database}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-600 italic">
                          {!isRecurring ? `On ${task.schedule?.startDate}` :
                           task.schedule?.frequency === 'Daily' ? 'Every day' :
                           task.schedule?.frequency === 'Weekly' ? `Run: ${task.schedule?.daysOfWeek?.join(', ')}` :
                           `On the ${task.schedule?.dayOfMonth}${task.schedule?.dayOfMonth === 1 ? 'st' : task.schedule?.dayOfMonth === 2 ? 'nd' : 'th'} of month`}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                            onClick={() => openEditModal(task)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-rose-500 rounded-lg"
                            onClick={() => confirmDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </section>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Create Maintenance Schedule
            </DialogTitle>
            <DialogDescription>
              Assign a new schedule to a pending maintenance task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Select Target Task</Label>
              <Select value={selectedTaskId} onValueChange={(val) => {
                setSelectedTaskId(val);
                const task = tasks.find(t => t.id === val);
                if (task) {
                  setJobName(task.name);
                  setJobCategory(task.jobCategory || "");
                }
              }}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Pick a task..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingTasks.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.database})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Job Name</Label>
              <Input 
                value={jobName} 
                onChange={(e) => setJobName(e.target.value)} 
                placeholder="e.g. Monthly Maintenance"
                className="h-11 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Job Type (Category)</Label>
              <Select value={jobCategory} onValueChange={setJobCategory}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Execution Pattern</Label>
              <RadioGroup value={executionPattern} onValueChange={(v: any) => setExecutionPattern(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="One-Time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer">One-Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Recurring" id="recurring" />
                  <Label htmlFor="recurring" className="cursor-pointer">Recurring</Label>
                </div>
              </RadioGroup>
            </div>

            {executionPattern === 'Recurring' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
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

                {scheduleForm.frequency === 'Weekly' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Run on days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <Button
                          key={day}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "h-8 text-[10px] font-bold uppercase",
                            scheduleForm.daysOfWeek?.includes(day) && "bg-primary text-white hover:bg-primary/90"
                          )}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleForm.frequency === 'Monthly' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Run on date (1-31)</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={31} 
                      value={scheduleForm.dayOfMonth || 1}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                      className="h-11 border-slate-200"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">
                  {executionPattern === 'One-Time' ? 'Execution Date' : 'Start Date'}
                </Label>
                <Input 
                  type="date" 
                  value={scheduleForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
              {executionPattern === 'Recurring' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500">End Date</Label>
                  <Input 
                    type="date" 
                    value={scheduleForm.endDate}
                    min={scheduleForm.startDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-11 border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={!selectedTaskId || !jobName || !jobCategory}
              onClick={handleFinalizeSchedule} 
              className="bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Finalize Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Maintenance Schedule
            </DialogTitle>
            <DialogDescription>
              Update frequency and details for the selected schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Job Name</Label>
              <Input 
                value={jobName} 
                onChange={(e) => setJobName(e.target.value)} 
                className="h-11 border-slate-200 font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Job Type (Category)</Label>
              <Select value={jobCategory} onValueChange={setJobCategory}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Execution Pattern</Label>
              <RadioGroup value={executionPattern} onValueChange={(v: any) => setExecutionPattern(v)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="One-Time" id="edit-one-time" />
                  <Label htmlFor="edit-one-time" className="cursor-pointer">One-Time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Recurring" id="edit-recurring" />
                  <Label htmlFor="edit-recurring" className="cursor-pointer">Recurring</Label>
                </div>
              </RadioGroup>
            </div>

            {executionPattern === 'Recurring' && (
              <div className="space-y-4">
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

                {scheduleForm.frequency === 'Weekly' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Run on days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <Button
                          key={day}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "h-8 text-[10px] font-bold uppercase",
                            scheduleForm.daysOfWeek?.includes(day) && "bg-primary text-white hover:bg-primary/90"
                          )}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleForm.frequency === 'Monthly' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Run on date (1-31)</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      max={31} 
                      value={scheduleForm.dayOfMonth || 1}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }))}
                      className="h-11 border-slate-200"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">
                  {executionPattern === 'One-Time' ? 'Execution Date' : 'Start Date'}
                </Label>
                <Input 
                  type="date" 
                  value={scheduleForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
              {executionPattern === 'Recurring' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-500">End Date</Label>
                  <Input 
                    type="date" 
                    value={scheduleForm.endDate}
                    min={scheduleForm.startDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-11 border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleFinalizeSchedule} 
              className="bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Update Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 mb-4">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-center font-bold">Delete Maintenance Task?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete the maintenance task and its schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

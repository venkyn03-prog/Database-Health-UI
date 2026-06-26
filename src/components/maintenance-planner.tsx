
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
  AlertTriangle
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
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
  const [editableTaskName, setEditableTaskName] = React.useState("")
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
      if (scheduleForm.endDate < scheduleForm.startDate) {
        toast({
          variant: "destructive",
          title: "Invalid End Date",
          description: "End date cannot be before the start date."
        })
        return
      }

      onUpdateTask(selectedTaskId, {
        status: 'scheduled',
        schedule: scheduleForm
      })
      
      setIsCreateModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedTaskId("")
      setEditableTaskName("")
      toast({
        title: isEditModalOpen ? "Schedule Updated" : "Schedule Created",
        description: `"${task?.name}" is now active.`
      })
    }
  }

  const openEditModal = (task: MaintenanceTask) => {
    setSelectedTaskId(task.id)
    setEditableTaskName(task.name)
    if (task.schedule) {
      setScheduleForm(task.schedule)
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
    setEditableTaskName("")
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
                <TableHead className="h-12 px-8 text-[10px] font-bold uppercase text-slate-400">Task Name</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Frequency</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Schedule Details</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Server/DB</TableHead>
                <TableHead className="h-12 text-[10px] font-bold uppercase text-slate-400">Timeframe</TableHead>
                <TableHead className="h-12 px-8 text-right text-[10px] font-bold uppercase text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                      <Calendar className="h-12 w-12" />
                      <span className="text-sm font-bold uppercase tracking-widest">No Active Schedules</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                scheduledTasks.map((task) => (
                  <TableRow key={task.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                    <TableCell className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center border",
                          task.type === 'Archiving' ? "bg-amber-50 text-amber-500 border-amber-100" :
                          task.type === 'Index Rebuild' ? "bg-blue-50 text-blue-500 border-blue-100" :
                          task.type === 'Scanning' ? "bg-purple-50 text-purple-500 border-purple-100" :
                          task.type === 'Multi-Task' ? "bg-slate-100 text-slate-600 border-slate-200" :
                          "bg-emerald-50 text-emerald-500 border-emerald-100"
                        )}>
                          {task.type === 'Archiving' ? <TableIcon className="h-5 w-5" /> : 
                           task.type === 'Index Rebuild' ? <Zap className="h-5 w-5" /> : 
                           task.type === 'Scanning' ? <Search className="h-5 w-5" /> :
                           task.type === 'Multi-Task' ? <LayoutGrid className="h-5 w-5" /> :
                           <RefreshCw className="h-5 w-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{task.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {task.type === 'Multi-Task' ? 'Multi-Action' : task.type}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">
                        {task.schedule?.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-600 italic">
                        {task.schedule?.frequency === 'Daily' ? 'Every day' :
                         task.schedule?.frequency === 'Weekly' ? `Run: ${task.schedule?.daysOfWeek?.join(', ')}` :
                         `On the ${task.schedule?.dayOfMonth}${task.schedule?.dayOfMonth === 1 ? 'st' : task.schedule?.dayOfMonth === 2 ? 'nd' : 'th'} of month`}
                      </span>
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
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        {task.schedule?.startDate} <span className="mx-1">→</span> {task.schedule?.endDate}
                      </div>
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
                ))
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
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
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
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
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
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">Start Date</Label>
                <Input 
                  type="date" 
                  value={scheduleForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button 
              disabled={!selectedTaskId}
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
              <Label className="text-sm font-semibold">Task Name</Label>
              <Input 
                value={editableTaskName}
                readOnly
                className="h-11 border-slate-200 font-bold bg-slate-50 cursor-not-allowed"
                placeholder="Task name"
              />
            </div>

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
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
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
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-500">Start Date</Label>
                <Input 
                  type="date" 
                  value={scheduleForm.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="h-11 border-slate-200"
                />
              </div>
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

"use client"

import * as React from "react"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ConnectDatabaseModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (dbName: string, serverName: string, tableCount: number) => void
}

export function ConnectDatabaseModal({ isOpen, onClose, onComplete }: ConnectDatabaseModalProps) {
  const { toast } = useToast()
  const [isTesting, setIsTesting] = React.useState(false)
  const [isTested, setIsTested] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    dataSourceName: "",
    serverName: "",
    authType: "sql",
    userName: "",
    password: "",
    database: ""
  })

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsTested(false)
        setFormData({
          dataSourceName: "",
          serverName: "",
          authType: "sql",
          userName: "",
          password: "",
          database: ""
        })
      }, 300)
    }
  }, [isOpen])

  const isValid = React.useMemo(() => {
    const common = formData.dataSourceName.trim() !== "" && 
                   formData.serverName.trim() !== "" && 
                   formData.database !== ""
    
    if (formData.authType === "windows") return common
    return common && formData.userName.trim() !== "" && formData.password.trim() !== ""
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsTested(false)
  }

  const handleTestConnection = () => {
    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      setIsTested(true)
      toast({
        title: "Connection Successful",
        description: `Successfully reached ${formData.serverName}`,
      })
    }, 1500)
  }

  const handleFinalize = () => {
    if (onComplete) {
      onComplete(formData.dataSourceName, formData.serverName, 0)
      toast({
        title: "Database Connected",
        description: `${formData.dataSourceName} has been successfully added. Please configure tables next.`
      })
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 border-none overflow-hidden rounded-[2rem] shadow-2xl [&>button]:hidden">
        <DialogHeader className="px-8 py-6 border-b flex flex-row items-center justify-between bg-white">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold text-[#4A6076]">
              New SQL Connection
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium">Enter your server credentials to establish a link.</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9 rounded-full border-2 border-emerald-500 hover:bg-emerald-50 p-0 transition-colors shadow-none"
          >
            <X className="h-4 w-4 text-emerald-600 stroke-[4px]" />
          </Button>
        </DialogHeader>

        <div className="p-8 bg-white space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-500">Data Source Name</Label>
            <Input 
              placeholder="e.g. Sales_Production" 
              className="h-11 border-slate-200 bg-slate-50/50 rounded-xl"
              value={formData.dataSourceName}
              onChange={(e) => handleInputChange("dataSourceName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-500">Server Address</Label>
            <Input 
              placeholder="SQLSRV-PROD-01" 
              className="h-11 border-slate-200 bg-slate-50/50 rounded-xl"
              value={formData.serverName}
              onChange={(e) => handleInputChange("serverName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-500">Authentication</Label>
            <Select 
              value={formData.authType} 
              onValueChange={(val) => handleInputChange("authType", val)}
            >
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">SQL Server Authentication</SelectItem>
                <SelectItem value="windows">Windows Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.authType === "sql" && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-500">Username</Label>
                <Input 
                  placeholder="admin" 
                  className="h-11 border-slate-200 bg-slate-50/50 rounded-xl"
                  value={formData.userName}
                  onChange={(e) => handleInputChange("userName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-500">Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="h-11 border-slate-200 bg-slate-50/50 rounded-xl"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-500">Select Database</Label>
            <Select 
              value={formData.database} 
              onValueChange={(val) => handleInputChange("database", val)}
            >
              <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 rounded-xl">
                <SelectValue placeholder="Select DB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WebPortalDB">WebPortalDB</SelectItem>
                <SelectItem value="ReportingDB">ReportingDB</SelectItem>
                <SelectItem value="SalesDB">SalesDB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || !formData.serverName || !formData.database}
              className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-slate-600 font-semibold"
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-500" />
              ) : isTested ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
              ) : null}
              {isTesting ? "Testing Connection..." : isTested ? "Connection Verified" : "Test Connection"}
            </Button>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 border-t bg-slate-50 flex sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-12 border-slate-300 bg-white text-slate-600 font-bold rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            disabled={!isValid || !isTested}
            onClick={handleFinalize}
            className="flex-1 h-12 font-bold rounded-xl bg-primary hover:bg-primary/90 text-white"
          >
            Add Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

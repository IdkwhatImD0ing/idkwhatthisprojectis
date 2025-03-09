"use client"

import { format } from "date-fns"
import { BriefcaseIcon, CreditCardIcon, SearchIcon, UserIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Application } from "@/types/application"

interface ApplicationSidebarProps {
  applications: Application[]
  onSelectApplication: (application: Application) => void
  selectedApplicationId: number | undefined
}

export default function ApplicationSidebar({
  applications,
  onSelectApplication,
  selectedApplicationId,
}: ApplicationSidebarProps) {
  // Get application type icon
  const getApplicationIcon = (type: string) => {
    switch (type) {
      case "platinum":
        return <CreditCardIcon className="h-4 w-4" />
      case "gold":
        return <CreditCardIcon className="h-4 w-4" />
      case "business":
        return <BriefcaseIcon className="h-4 w-4" />
      case "student":
        return <UserIcon className="h-4 w-4" />
      case "secured":
        return <CreditCardIcon className="h-4 w-4" />
      default:
        return <CreditCardIcon className="h-4 w-4" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      case "review":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Under Review
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applications</h2>
        </div>
        <div className="relative mt-2">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search applications..." className="w-full pl-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2 pb-6">
          <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">APPLICATION LIST</h3>
          <SidebarMenu className="h-full gap-1">
            {applications.map((application) => (
              <SidebarMenuItem key={application.id} >
                <SidebarMenuButton
                  onClick={() => onSelectApplication(application)}
                  isActive={application.id === selectedApplicationId}
                  className="h-[50px]"
                >
                  <div className="flex w-full items-center py-2">
                    <div
                      className={cn(
                        "mr-2 flex h-8 w-8 items-center justify-center rounded-full",
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {getApplicationIcon("student")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{application.name ? application.name : "No name"}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <span className="truncate">{format(application.created_at, "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>

                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}


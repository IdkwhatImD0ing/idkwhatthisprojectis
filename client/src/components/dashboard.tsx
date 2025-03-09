"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import ApplicationSidebar from "@/components/application-sidebar"
import ApplicationDetails from "@/components/application-details"
import { BankHeader } from "@/components/bank-header"
import { createClient } from "@/utils/supabase/client"
import { Application } from "@/types/application"


const supabase = createClient()

export default function Dashboard() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: applications, error } = await supabase.from("applications").select("*").order('created_at', { ascending: false })
      if (error) {
        console.error(error)
      } else {
        console.log(applications)
        setApplications(applications)
      }
    }
    fetchApplications()

    const channel = supabase.channel("applications")
    channel.on("postgres_changes", { event: "*", schema: "public", table: "applications" }, (payload) => {
      console.log(payload)
    })
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  




  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-1 w-full overflow-hidden">
          <ApplicationSidebar
            applications={applications}
            onSelectApplication={setSelectedApplication}
            selectedApplicationId={selectedApplication?.id}
          />
          <main className="flex-1 w-full flex flex-col">
            <BankHeader />
            <div className="flex-1 overflow-y-auto">
              {selectedApplication ? (
                <ApplicationDetails application={selectedApplication} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Select an application to view details</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose an application from the sidebar to view its details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
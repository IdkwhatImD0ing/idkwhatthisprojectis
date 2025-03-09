import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
    CalendarIcon,
    CheckCircle2Icon,
    ClockIcon,
    DollarSignIcon,
    FileTextIcon,
    UserIcon,
    XCircleIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Application } from "@/types/application"
import PdfViewer from "./pdf-viewer"


interface ApplicationDetailsProps {
    application: Application
}

export default function ApplicationDetails({ application }: ApplicationDetailsProps) {
    const [pdfData, setPdfData] = useState<Blob | null>(null)

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
            case "approved":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
            case "rejected":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
            case "review":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>
            default:
                return null
        }
    }

    useEffect(() => {
        const fetchPDFData = async () => {
            if (application) {
                const response = await fetch("/api/pdf", {
                    method: "POST",
                    body: JSON.stringify(application),
                })
                const data = await response.blob()
                setPdfData(data)
            }
        }
        fetchPDFData()
    }, [application])



    return (
        <div className="flex flex-col h-full">
            <div className="border-b bg-white dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold">{application.name ? application.name : "No name"}</h2>
                            {getStatusBadge("pending")}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Application ID: {application.id}</div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-1">
                            <FileTextIcon className="h-4 w-4" />
                            Export PDF
                        </Button>
                        <>
                            <Button
                                variant="outline"
                                className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                                <XCircleIcon className="h-4 w-4" />
                                Reject
                            </Button>
                            <Button className="gap-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle2Icon className="h-4 w-4" />
                                Approve
                            </Button>
                        </>

                    </div>
                </div>
                <div className="grid grid-cols-4 px-6 py-2 text-sm border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Applicant:</span>
                        <span>{application.name ? application.name : "No name"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Submitted:</span>
                        <span>{format(application.created_at, "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Credit Limit:</span>
                        <span>${application.creditlimit?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Processing Time:</span>
                        <span>3 days</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <Card className="overflow-hidden">
                            <div className="bg-primary/5 px-6 py-3 border-b">
                                <h3 className="font-medium">Application Details</h3>
                            </div>
                            <CardContent className="p-6">
                                {pdfData && <PdfViewer pdfBlob={pdfData} />}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">


                        <Card>
                            <div className="bg-primary/5 px-6 py-3 border-b">
                                <h3 className="font-medium">Applicant Information</h3>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium">Full Name</div>
                                        <div>{application.name ? application.name : "No name"}</div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium">Contact Information</div>
                                        <div>{application.email ? application.email : "No email"}</div>
                                        <div>{application.phone ? application.phone : "No phone"}</div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium">Address</div>
                                        <div>{application.resstreet ? application.resstreet : "No address"}</div>
                                        <div>{application.rescity ? application.rescity : "No city"}, {application.resstate ? application.resstate : "No state"} {application.reszip ? application.reszip : "No zip"}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <div className="bg-primary/5 px-6 py-3 border-b">
                                <h3 className="font-medium">Application Timeline</h3>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-1 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="text-sm font-medium">Application Submitted</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(application.created_at, "MMM d, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-1 bg-green-500 rounded-full"></div>
                                        <div>
                                            <div className="text-sm font-medium">Initial Credit Check</div>
                                            <div className="text-sm text-muted-foreground">
                                                {format(new Date(application.created_at), "MMM d, yyyy 'at' h:mm a")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div
                                            className="w-1 bg-green-500 rounded-full"
                                        ></div>
                                        <div>
                                            <div className="text-sm font-medium">Credit Limit Assessment</div>
                                            <div className="text-sm text-muted-foreground">
                                                In Progress
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div
                                            className={cn(
                                                "w-1 rounded-full",
                                                "bg-gray-300",
                                            )}
                                        ></div>
                                        <div>
                                            <div className="text-sm font-medium">Card Approval Decision</div>
                                            <div className="text-sm text-muted-foreground">
                                                Pending
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}


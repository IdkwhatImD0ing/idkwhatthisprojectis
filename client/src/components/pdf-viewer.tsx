"use client"

import { useState, useEffect, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    Maximize2,
    Minimize2,
    Search,
    Printer,
    FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// Sample PDF for demo purposes
const SAMPLE_PDF = "https://arxiv.org/pdf/2104.13478.pdf"

interface PdfViewerProps {
    pdfBlob?: Blob
    pdfUrl?: string
    defaultScale?: number
}

export default function PdfViewer({ pdfBlob, pdfUrl = SAMPLE_PDF, defaultScale = 1.0 }: PdfViewerProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [scale, setScale] = useState<number>(defaultScale)
    const [rotation, setRotation] = useState<number>(0)
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
    const [thumbnails, setThumbnails] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [searchText, setSearchText] = useState<string>("")
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (pdfBlob) {
            const objectUrl = URL.createObjectURL(pdfBlob)
            setUrl(objectUrl)
            return () => URL.revokeObjectURL(objectUrl)
        } else if (pdfUrl) {
            setUrl(pdfUrl)
        }
    }, [pdfBlob, pdfUrl])

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setPageNumber(1)
        setIsLoading(false)

        // Generate thumbnail indices
        const thumbs = []
        for (let i = 1; i <= Math.min(numPages, 20); i++) {
            thumbs.push(i)
        }
        setThumbnails(thumbs)
    }

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(prev - 1, 1))
    }

    const goToNextPage = () => {
        setPageNumber((prev) => (prev < numPages ? prev + 1 : prev))
    }

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 3))
    }

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5))
    }

    const rotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`)
            })
        } else {
            document.exitFullscreen().catch((err) => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`)
            })
        }
        setIsFullscreen(!isFullscreen)
    }

    const handlePrint = () => {
        if (url) {
            const printWindow = window.open(url, "_blank")
            printWindow?.addEventListener("load", () => {
                printWindow.print()
            })
        }
    }

    const handleDownload = () => {
        if (url) {
            const link = document.createElement("a")
            link.href = url
            link.download = "document.pdf"
            link.click()
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-col bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300",
                isFullscreen ? "fixed inset-0 z-50" : "relative border",
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b bg-muted/40">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-md border bg-background">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={goToPrevPage}
                                        disabled={pageNumber <= 1}
                                        className="h-8 w-8"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Previous page</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="flex items-center px-2 text-sm">
                            <Input
                                type="number"
                                min={1}
                                max={numPages}
                                value={pageNumber}
                                onChange={(e) => setPageNumber(Math.min(Math.max(1, Number.parseInt(e.target.value) || 1), numPages))}
                                className="w-12 h-7 text-center"
                            />
                            <span className="mx-1 text-muted-foreground">/</span>
                            <span>{numPages}</span>
                        </div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={goToNextPage}
                                        disabled={pageNumber >= numPages}
                                        className="h-8 w-8"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Next page</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Separator orientation="vertical" className="h-8" />

                    <div className="flex items-center space-x-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8">
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom out</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="w-24">
                            <Slider
                                value={[scale * 100]}
                                min={50}
                                max={300}
                                step={10}
                                onValueChange={(value) => setScale(value[0] / 100)}
                            />
                        </div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8">
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom in</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <div className="relative mr-2">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-8 h-8 w-40"
                        />
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={rotate} className="h-8 w-8">
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rotate</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handlePrint} className="h-8 w-8">
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
                                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Thumbnails sidebar */}
                <div className="hidden md:block w-[180px] border-r bg-muted/30">
                    <ScrollArea className="h-full max-h-[850px]">
                        <div className="p-2 space-y-2">
                            {thumbnails.map((pageIdx) => (
                                <Card
                                    key={pageIdx}
                                    className={cn(
                                        "overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                                        pageNumber === pageIdx ? "ring-2 ring-primary" : "",
                                    )}
                                    onClick={() => setPageNumber(pageIdx)}
                                >
                                    <CardContent className="p-1">
                                        <div className="relative bg-background flex items-center justify-center h-[100px]">
                                            {url && (
                                                <Document file={url} loading={<div className="animate-pulse bg-muted h-full w-full" />}>
                                                    <Page
                                                        pageNumber={pageIdx}
                                                        width={120}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                    />
                                                </Document>
                                            )}
                                            <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm">
                                                {pageIdx}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                        </div>
                    </ScrollArea>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-muted/20 flex items-start justify-center p-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <FileText className="h-16 w-16 text-muted-foreground animate-pulse" />
                            <p className="mt-4 text-muted-foreground">Loading PDF...</p>
                        </div>
                    )}

                    {url && (
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <FileText className="h-16 w-16 text-muted-foreground animate-pulse" />
                                    <p className="mt-4 text-muted-foreground">Loading PDF...</p>
                                </div>
                            }
                            error={
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <p className="text-destructive">Failed to load PDF</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        There was an error loading the document. Please try again.
                                    </p>
                                </div>
                            }
                            className="shadow-xl"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotation}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="bg-white shadow-lg"
                            />
                        </Document>
                    )}
                </div>
            </div>
        </div>
    )
}


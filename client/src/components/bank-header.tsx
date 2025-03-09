import { BellIcon, SearchIcon, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "./ui/sidebar"

export function BankHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-slate-950 dark:border-slate-800">

      <div className="flex items-center gap-2 font-semibold text-xl">
        <SidebarTrigger />
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>
        <span>HackMerced Bank</span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md ml-2">Credit Card Portal</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative w-64">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="w-full bg-background pl-8 md:w-[240px] lg:w-[320px]"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <div className="font-medium">Admin User</div>
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}


import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";
import tecnaritLogo from "../../assets/tecnarit-logo.png";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2 lg:hidden">
      <div className="flex-1 flex justify-center items-center h-12 overflow-hidden">
        <img src={tecnaritLogo} alt="TECNARIT" className="h-full w-full object-contain" />
      </div>
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:text-primary/80">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

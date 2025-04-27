import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";
import tecnaritLogo from "../../assets/tecnarit-logo.png";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-primary-200 bg-white px-4 py-1.5 lg:hidden">
      <div>
        <img src={tecnaritLogo} alt="TECNARIT" className="h-8" />
      </div>
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
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

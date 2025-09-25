"use client";

import { Drawer } from "vaul";
import { NexusSidebar } from "./nexus-sidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function NexusMobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="fixed top-3 right-3 z-50 bg-synapse-beige hover:bg-synapse-beige/90 md:hidden transition-all duration-300 flex items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <Bars3Icon 
            className={`absolute w-6 h-6 transition-all duration-300 ${
              open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
            }`} 
          />
          <XMarkIcon 
            className={`absolute w-6 h-6 transition-all duration-300 ${
              open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
            }`} 
          />
        </div>
      </Button>

      {/* Vaul Drawer */}
      <Drawer.Root 
        direction="left" 
        open={open} 
        onOpenChange={setOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-synapse-beige h-full fixed top-0 left-0 bottom-0 outline-none w-[80vw] max-w-sm">
            {/* Nexus Sidebar Content */}
            <NexusSidebar onNavigate={() => setOpen(false)} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

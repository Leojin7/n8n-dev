"use client"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { NodeSelector } from "@/components/node-selector";


export const AddNodeButton = memo(() => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <NodeSelector open={showMenu} onOpenChange={setShowMenu}>
      <Button
        variant="outline"
        size="icon"
        className="bg-background"
      >
        <PlusIcon />
      </Button>
    </NodeSelector>
  );
});


AddNodeButton.displayName = "AddNodeButton";
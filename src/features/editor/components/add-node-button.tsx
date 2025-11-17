"use client"
import { PlusIcon } from "lucide-react"
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";


export const AddNodeButton = memo(() => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <Button
      variant="outline"
      size="icon"
      className="bg-background"
      onClick={() => setShowMenu(!showMenu)}
    >
      <PlusIcon className="mr-2 h-4 w-4" />
    </Button>
  );
});


AddNodeButton.displayName = "AddNodeButton";
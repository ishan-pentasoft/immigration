import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ToolTip({
  children,
  content,
  ...triggerProps
}: {
  children: React.ReactElement;
  content: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {React.cloneElement(children, triggerProps)}
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

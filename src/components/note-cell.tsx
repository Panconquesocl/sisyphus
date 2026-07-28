"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NoteCell({ date, content }: { date: string; content: string }) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        title={date}
        aria-label={`Nota del ${date}`}
        className="cursor-pointer rounded-[2px]"
        style={{ width: 11, height: 11, background: "var(--note)", border: "none", padding: 0 }}
      />
      <PopoverContent align="start" className="w-64">
        <p className="text-xs text-muted-foreground">{date}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm">{content}</p>
      </PopoverContent>
    </Popover>
  );
}
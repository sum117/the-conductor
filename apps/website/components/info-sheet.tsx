import React from "react";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "./ui/sheet";

type InfoSheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
};
export function InfoSheet({onOpenChange, open, children, title, description}: InfoSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="bottom" className="max-h-[100dvh] overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="text-center text-3xl">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

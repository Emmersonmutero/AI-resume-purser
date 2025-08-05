"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    {/* Desktop Table */}
    <div className="hidden md:block">
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            {children}
          </table>
        </div>
      </div>
    </div>
    
    {/* Mobile Cards */}
    <div className="md:hidden space-y-4">
      {children}
    </div>
  </div>
));
ResponsiveTable.displayName = "ResponsiveTable";

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("hidden md:table-header-group [&_tr]:border-b", className)} {...props} />
));
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    mobileRender?: (children: React.ReactNode) => React.ReactNode;
  }
>(({ className, children, mobileRender, ...props }, ref) => (
  <>
    {/* Desktop */}
    <tbody
      ref={ref}
      className={cn("hidden md:table-row-group [&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
    
    {/* Mobile */}
    {mobileRender && (
      <div className="md:hidden">
        {mobileRender(children)}
      </div>
    )}
  </>
));
ResponsiveTableBody.displayName = "ResponsiveTableBody";

const ResponsiveTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("hidden md:table-footer-group border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
ResponsiveTableFooter.displayName = "ResponsiveTableFooter";

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
    {...props}
  />
));
ResponsiveTableRow.displayName = "ResponsiveTableRow";

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
ResponsiveTableHead.displayName = "ResponsiveTableHead";

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
ResponsiveTableCell.displayName = "ResponsiveTableCell";

const ResponsiveTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
ResponsiveTableCaption.displayName = "ResponsiveTableCaption";

// Mobile Card Component for table rows
const MobileTableCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <Card ref={ref} className={cn("p-4", className)} {...props}>
    <CardContent className="p-0 space-y-2">
      {children}
    </CardContent>
  </Card>
));
MobileTableCard.displayName = "MobileTableCard";

const MobileTableField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value: React.ReactNode;
  }
>(({ className, label, value, ...props }, ref) => (
  <div ref={ref} className={cn("flex justify-between items-center", className)} {...props}>
    <span className="text-sm font-medium text-muted-foreground">{label}:</span>
    <span className="text-sm">{value}</span>
  </div>
));
MobileTableField.displayName = "MobileTableField";

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableFooter,
  ResponsiveTableHead,
  ResponsiveTableRow,
  ResponsiveTableCell,
  ResponsiveTableCaption,
  MobileTableCard,
  MobileTableField,
};
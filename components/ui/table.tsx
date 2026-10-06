"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TableResizeContextValue = {
  widths: Record<string, number>;
  setWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  hasCustomWidths: boolean;
};

const TableResizeContext = React.createContext<TableResizeContextValue | null>(null);

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => {
    const [widths, setWidths] = React.useState<Record<string, number>>({});
    const hasCustomWidths = Object.keys(widths).length > 0;

    const value = React.useMemo(
      () => ({ widths, setWidths, hasCustomWidths }),
      [widths, hasCustomWidths]
    );

    return (
      <TableResizeContext.Provider value={value}>
        <div className="relative w-full overflow-auto">
          <table
            ref={ref}
            className={cn(
              "w-full caption-bottom text-sm",
              hasCustomWidths && "table-fixed",
              className
            )}
            {...props}
          />
        </div>
      </TableResizeContext.Provider>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  /** Enable drag-to-resize. Defaults to true. */
  resizable?: boolean;
  /** Stable key for width persistence across header rows. */
  columnKey?: string;
};

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, resizable = true, columnKey, style, ...props }, ref) => {
    const resize = React.useContext(TableResizeContext);
    const localRef = React.useRef<HTMLTableCellElement | null>(null);
    const autoKey = React.useId();
    const key = columnKey ?? autoKey;
    const width = resize?.widths[key];

    const setRefs = React.useCallback(
      (node: HTMLTableCellElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    function handleResizeStart(event: React.MouseEvent) {
      if (!resizable || !resize || !localRef.current) return;
      event.preventDefault();
      event.stopPropagation();

      const th = localRef.current;
      const row = th.parentElement;
      if (!row) return;

      // Lock every header in this row to its current pixel width
      const nextWidths: Record<string, number> = { ...resize.widths };
      Array.from(row.children).forEach((cell) => {
        if (!(cell instanceof HTMLTableCellElement)) return;
        const cellKey = cell.dataset.columnKey;
        if (!cellKey) return;
        if (nextWidths[cellKey] == null) {
          nextWidths[cellKey] = Math.round(cell.getBoundingClientRect().width);
        }
      });

      const startX = event.clientX;
      const startWidth = nextWidths[key] ?? Math.round(th.getBoundingClientRect().width);
      nextWidths[key] = startWidth;
      resize.setWidths(nextWidths);

      const onMove = (ev: MouseEvent) => {
        const next = Math.max(72, Math.round(startWidth + (ev.clientX - startX)));
        resize.setWidths((prev) => ({ ...prev, [key]: next }));
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }

    return (
      <th
        ref={setRefs}
        data-column-key={key}
        style={{
          ...style,
          ...(width ? { width, minWidth: width, maxWidth: width } : undefined),
        }}
        className={cn(
          "relative h-11 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
        {resizable && (
          <span
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize column"
            onMouseDown={handleResizeStart}
            className="absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none select-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-transparent hover:after:bg-border active:after:bg-foreground/30"
          />
        )}
      </th>
    );
  }
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("overflow-hidden p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

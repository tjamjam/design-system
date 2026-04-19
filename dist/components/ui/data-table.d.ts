import { ColumnDef, type Column, type Table as TanstackTable } from "@tanstack/react-table";
import * as React from "react";
type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: keyof TData & string;
    searchPlaceholder?: string;
    selectable?: boolean;
    pageSize?: number;
    toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
    emptyMessage?: string;
};
export declare function DataTable<TData, TValue>({ columns: columnsProp, data, searchKey, searchPlaceholder, selectable, pageSize, toolbar, emptyMessage, }: DataTableProps<TData, TValue>): import("react/jsx-runtime").JSX.Element;
export declare function DataTableColumnHeader<TData, TValue>({ column, title, className, }: {
    column: Column<TData, TValue>;
    title: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=data-table.d.ts.map
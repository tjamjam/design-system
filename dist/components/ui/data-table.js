"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Columns3, Search, } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "./dropdown-menu";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "./select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "./table";
import { cn } from "../../lib/utils";
export function DataTable({ columns: columnsProp, data, searchKey, searchPlaceholder = "Search…", selectable = false, pageSize = 10, toolbar, emptyMessage = "No results.", }) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const columns = React.useMemo(() => {
        if (!selectable)
            return columnsProp;
        const selectionColumn = {
            id: "__select",
            header: ({ table }) => (_jsx(Checkbox, { checked: table.getIsAllPageRowsSelected(), indeterminate: !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected(), onCheckedChange: (v) => table.toggleAllPageRowsSelected(!!v), "aria-label": "Select all" })),
            cell: ({ row }) => (_jsx(Checkbox, { checked: row.getIsSelected(), onCheckedChange: (v) => row.toggleSelected(!!v), "aria-label": "Select row" })),
            enableSorting: false,
            enableHiding: false,
            size: 32,
        };
        return [selectionColumn, ...columnsProp];
    }, [columnsProp, selectable]);
    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize } },
        enableRowSelection: selectable,
    });
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [(searchKey || toolbar) && (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [searchKey && (_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { className: "w-[240px] pl-8", placeholder: searchPlaceholder, value: table.getColumn(searchKey)?.getFilterValue() ?? "", onChange: (e) => table.getColumn(searchKey)?.setFilterValue(e.target.value) })] })), toolbar?.(table)] }), _jsx(DataTableViewOptions, { table: table })] })), _jsx("div", { className: "rounded-lg border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: table.getHeaderGroups().map((headerGroup) => (_jsx(TableRow, { children: headerGroup.headers.map((header) => (_jsx(TableHead, { children: header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx(TableBody, { children: table.getRowModel().rows.length ? (table.getRowModel().rows.map((row) => (_jsx(TableRow, { "data-state": row.getIsSelected() ? "selected" : undefined, children: row.getVisibleCells().map((cell) => (_jsx(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, className: "h-24 text-center text-muted-foreground", children: emptyMessage }) })) })] }) }), _jsx(DataTablePagination, { table: table })] }));
}
export function DataTableColumnHeader({ column, title, className, }) {
    if (!column.getCanSort()) {
        return _jsx("span", { className: className, children: title });
    }
    const sorted = column.getIsSorted();
    return (_jsxs(Button, { variant: "ghost", size: "sm", className: cn("-ml-2 h-7 px-2 text-xs font-medium", className), onClick: () => column.toggleSorting(sorted === "asc"), children: [title, sorted === "asc" ? (_jsx(ArrowUp, { className: "size-3" })) : sorted === "desc" ? (_jsx(ArrowDown, { className: "size-3" })) : (_jsx(ChevronsUpDown, { className: "size-3 opacity-50" }))] }));
}
function DataTableViewOptions({ table }) {
    const hideableColumns = table
        .getAllColumns()
        .filter((c) => typeof c.accessorFn !== "undefined" && c.getCanHide());
    if (hideableColumns.length === 0)
        return null;
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Columns3, { className: "size-4" }), " Columns"] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-[180px]", children: [_jsx(DropdownMenuLabel, { children: "Toggle columns" }), _jsx(DropdownMenuSeparator, {}), hideableColumns.map((column) => (_jsx(DropdownMenuCheckboxItem, { className: "capitalize", checked: column.getIsVisible(), onCheckedChange: (v) => column.toggleVisibility(!!v), children: column.id }, column.id)))] })] }));
}
function DataTablePagination({ table }) {
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    const totalFiltered = table.getFilteredRowModel().rows.length;
    return (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 px-1", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: selectedCount > 0 ? (_jsxs("span", { children: [selectedCount, " of ", totalFiltered, " row", totalFiltered === 1 ? "" : "s", " selected."] })) : (_jsxs("span", { children: [totalFiltered, " row", totalFiltered === 1 ? "" : "s", "."] })) }), _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Rows per page" }), _jsxs(Select, { value: `${table.getState().pagination.pageSize}`, onValueChange: (v) => v && table.setPageSize(Number(v)), children: [_jsx(SelectTrigger, { className: "w-[72px]", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: [10, 20, 30, 50].map((n) => (_jsx(SelectItem, { value: `${n}`, children: n }, n))) })] })] }), _jsxs("div", { className: "text-xs text-muted-foreground tabular-nums", children: ["Page ", table.getState().pagination.pageIndex + 1, " of", " ", Math.max(1, table.getPageCount())] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "icon-sm", "aria-label": "First page", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage(), children: _jsx(ChevronsLeft, {}) }), _jsx(Button, { variant: "outline", size: "icon-sm", "aria-label": "Previous page", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), children: _jsx(ChevronLeft, {}) }), _jsx(Button, { variant: "outline", size: "icon-sm", "aria-label": "Next page", onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), children: _jsx(ChevronRight, {}) }), _jsx(Button, { variant: "outline", size: "icon-sm", "aria-label": "Last page", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage(), children: _jsx(ChevronsRight, {}) })] })] })] }));
}
//# sourceMappingURL=data-table.js.map
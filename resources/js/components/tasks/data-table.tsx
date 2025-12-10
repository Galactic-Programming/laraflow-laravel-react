import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filters?: {
        search?: string;
        status?: string | string[];
        priority?: string | string[];
        per_page?: number;
        sort?: string;
        order?: string;
    };
    onFilterChange?: (filters: Record<string, any>) => void;
    pagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
    onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filters,
    onFilterChange,
    pagination: serverPagination,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>(() => {
            // Load from localStorage
            const saved = localStorage.getItem('taskTableColumnVisibility');
            return saved ? JSON.parse(saved) : {};
        });
    const [sorting, setSorting] = React.useState<SortingState>([]);

    // Save to localStorage when columnVisibility changes
    React.useEffect(() => {
        localStorage.setItem(
            'taskTableColumnVisibility',
            JSON.stringify(columnVisibility),
        );
    }, [columnVisibility]);

    // Sync columnVisibility state when it changes
    const handleColumnVisibilityChange = React.useCallback((updater: any) => {
        setColumnVisibility((old) => {
            const newState =
                typeof updater === 'function' ? updater(old) : updater;
            return newState;
        });
    }, []);

    // Track previous sorting to detect changes
    const prevSortingRef = React.useRef<SortingState>([]);

    // Handle server-side sorting
    React.useEffect(() => {
        if (!serverPagination || !onFilterChange) return;

        const prevSorting = prevSortingRef.current;
        const sortingChanged =
            JSON.stringify(prevSorting) !== JSON.stringify(sorting);

        if (sortingChanged) {
            prevSortingRef.current = sorting;

            if (sorting.length > 0) {
                const sortField = sorting[0].id;
                const sortOrder = sorting[0].desc ? 'desc' : 'asc';
                onFilterChange({
                    sort: sortField,
                    order: sortOrder,
                    page: 1, // Reset to page 1 when sorting changes
                });
            } else {
                // Clear sorting
                onFilterChange({
                    sort: undefined,
                    order: undefined,
                    page: 1,
                });
            }
        }
    }, [sorting, serverPagination, onFilterChange]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination: serverPagination
                ? {
                      pageIndex: serverPagination.pageIndex,
                      pageSize: serverPagination.pageSize,
                  }
                : {
                      pageIndex: 0,
                      pageSize: 25,
                  },
        },
        pageCount:
            serverPagination?.pageCount ?? Math.ceil((data?.length || 0) / 25),
        manualPagination: !!serverPagination,
        manualSorting: !!serverPagination,
        enableSortingRemoval: true, // Enable clicking 3rd time to remove sort
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: serverPagination
            ? undefined
            : getPaginationRowModel(),
        getSortedRowModel: serverPagination ? undefined : getSortedRowModel(),
    });

    return (
        <div className="flex flex-col gap-4">
            <DataTableToolbar
                table={table}
                filters={filters}
                onFilterChange={onFilterChange}
                onSortingReset={() => setSorting([])}
            />
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        // Don't trigger row click if clicking on actions button or checkbox
                                        const target = e.target as HTMLElement;
                                        if (
                                            target.closest('button') ||
                                            target.closest('[role="checkbox"]')
                                        ) {
                                            return;
                                        }
                                        onRowClick?.(row.original);
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination
                table={table}
                onFilterChange={onFilterChange}
                serverPagination={serverPagination}
            />
        </div>
    );
}

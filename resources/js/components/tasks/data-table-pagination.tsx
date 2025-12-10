import { Table } from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    onFilterChange?: (filters: Record<string, any>) => void;
    serverPagination?: {
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        total: number;
    };
}

export function DataTablePagination<TData>({
    table,
    onFilterChange,
    serverPagination,
}: DataTablePaginationProps<TData>) {
    const handlePageChange = (newPageIndex: number) => {
        if (serverPagination && onFilterChange) {
            // Server-side pagination (Laravel uses 1-based page numbers)
            onFilterChange({
                page: newPageIndex + 1,
            });
        } else {
            // Client-side pagination fallback
            table.setPageIndex(newPageIndex);
        }
    };

    const handlePageSizeChange = (newPageSize: string) => {
        const size = Number(newPageSize);
        if (serverPagination && onFilterChange) {
            // Server-side pagination - reset to page 1 when changing page size
            onFilterChange({
                per_page: size,
                page: 1,
            });
        } else {
            // Client-side pagination fallback
            table.setPageSize(size);
        }
    };

    const currentPage = serverPagination
        ? serverPagination.pageIndex
        : (table.getState().pagination?.pageIndex ?? 0);
    const pageCount = serverPagination
        ? serverPagination.pageCount
        : table.getPageCount();
    const total = serverPagination
        ? serverPagination.total
        : table.getFilteredRowModel().rows.length;
    const pageSize = serverPagination
        ? serverPagination.pageSize
        : (table.getState().pagination?.pageSize ?? 10);

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of {total}{' '}
                row(s) selected.
            </div>
            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue>{pageSize}</SelectValue>
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 15, 20, 25, 30, 50, 100].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage + 1} of {pageCount}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= pageCount - 1}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => handlePageChange(pageCount - 1)}
                        disabled={currentPage >= pageCount - 1}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}

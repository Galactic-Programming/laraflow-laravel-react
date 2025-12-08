'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
    CheckCircle2Icon,
    CircleIcon,
    Loader2Icon,
    MoreVerticalIcon,
} from 'lucide-react';
import * as React from 'react';

import { DragHandle } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// Types
// ============================================================================

export interface ActionMenuItem {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    separator?: boolean;
}

export type StatusType = 'done' | 'in-progress' | 'not-started' | 'pending';

// ============================================================================
// Column Helpers
// ============================================================================

/**
 * Creates a drag handle column for reorderable rows
 */
export function createDragColumn<
    TData extends { id: string | number },
>(): ColumnDef<TData> {
    return {
        id: 'drag',
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        enableSorting: false,
        enableHiding: false,
    };
}

/**
 * Creates a selection checkbox column
 */
export function createSelectColumn<TData>(): ColumnDef<TData> {
    return {
        id: 'select',
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    };
}

/**
 * Creates an actions column with dropdown menu
 */
export function createActionsColumn<TData>(
    getActions: (row: TData) => ActionMenuItem[],
): ColumnDef<TData> {
    return {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
            const actions = getActions(row.original);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                            size="icon"
                        >
                            <MoreVerticalIcon className="size-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        {actions.map((action, index) => (
                            <React.Fragment key={action.label}>
                                {action.separator && index > 0 && (
                                    <DropdownMenuSeparator />
                                )}
                                <DropdownMenuItem
                                    onClick={action.onClick}
                                    variant={action.variant}
                                >
                                    {action.label}
                                </DropdownMenuItem>
                            </React.Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
        enableSorting: false,
        enableHiding: false,
    };
}

// ============================================================================
// Cell Components
// ============================================================================

interface StatusBadgeProps {
    status: StatusType | string;
    label?: string;
}

/**
 * Status badge component for displaying row status
 */
export function StatusBadge({ status, label }: StatusBadgeProps) {
    const normalizedStatus = status
        .toLowerCase()
        .replace(/\s+/g, '-') as StatusType;

    const statusConfig: Record<
        StatusType,
        { icon: React.ReactNode; className?: string }
    > = {
        done: {
            icon: (
                <CheckCircle2Icon className="size-3.5 fill-green-500 text-white dark:fill-green-400" />
            ),
        },
        'in-progress': {
            icon: <Loader2Icon className="size-3.5 animate-spin" />,
        },
        'not-started': {
            icon: <CircleIcon className="size-3.5" />,
        },
        pending: {
            icon: <Loader2Icon className="size-3.5" />,
        },
    };

    const config =
        statusConfig[normalizedStatus] || statusConfig['not-started'];
    const displayLabel = label || status;

    return (
        <Badge variant="outline" className="gap-1 px-1.5 text-muted-foreground">
            {config.icon}
            {displayLabel}
        </Badge>
    );
}

interface TypeBadgeProps {
    type: string;
    className?: string;
}

/**
 * Type badge component for displaying category/type
 */
export function TypeBadge({ type, className }: TypeBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`px-1.5 text-muted-foreground ${className || ''}`}
        >
            {type}
        </Badge>
    );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a text column with optional custom cell renderer
 */
export function createTextColumn<TData>(
    accessorKey: keyof TData & string,
    header: string,
    options?: {
        enableHiding?: boolean;
        cell?: (value: TData[keyof TData], row: TData) => React.ReactNode;
    },
): ColumnDef<TData> {
    return {
        accessorKey,
        header,
        enableHiding: options?.enableHiding ?? true,
        cell: options?.cell
            ? ({ row }) =>
                  options.cell!(row.original[accessorKey], row.original)
            : undefined,
    };
}

/**
 * Creates a badge column
 */
export function createBadgeColumn<TData>(
    accessorKey: keyof TData & string,
    header: string,
    options?: {
        width?: string;
    },
): ColumnDef<TData> {
    return {
        accessorKey,
        header,
        cell: ({ row }) => (
            <div className={options?.width || 'w-32'}>
                <TypeBadge type={String(row.original[accessorKey])} />
            </div>
        ),
    };
}

/**
 * Creates a status column
 */
export function createStatusColumn<TData>(
    accessorKey: keyof TData & string,
    header: string = 'Status',
): ColumnDef<TData> {
    return {
        accessorKey,
        header,
        cell: ({ row }) => (
            <StatusBadge status={String(row.original[accessorKey])} />
        ),
    };
}

/**
 * Creates a right-aligned number column
 */
export function createNumberColumn<TData>(
    accessorKey: keyof TData & string,
    header: string,
    options?: {
        format?: (value: number) => string;
    },
): ColumnDef<TData> {
    return {
        accessorKey,
        header: () => <div className="w-full text-right">{header}</div>,
        cell: ({ row }) => {
            const value = row.original[accessorKey];
            const numValue = typeof value === 'number' ? value : Number(value);
            const formatted = options?.format
                ? options.format(numValue)
                : String(value);

            return <div className="text-right">{formatted}</div>;
        },
    };
}

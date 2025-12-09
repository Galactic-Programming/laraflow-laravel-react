'use client';

import { Row, Table } from '@tanstack/react-table';
import { MoreHorizontal, Pen, Tags, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label, Task } from '@/types/task';

// Define available labels with colors matching TaskLabel enum
const AVAILABLE_LABELS: Label[] = [
    {
        id: 1,
        name: 'Bug',
        color: '#ef4444',
        description: "Something isn't working",
        category: 'Type',
        sort_order: 1,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 2,
        name: 'Feature',
        color: '#22c55e',
        description: 'New feature or request',
        category: 'Type',
        sort_order: 2,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 3,
        name: 'Enhancement',
        color: '#3b82f6',
        description: 'Improvement to existing feature',
        category: 'Type',
        sort_order: 3,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 4,
        name: 'Documentation',
        color: '#6366f1',
        description: 'Documentation improvements',
        category: 'Type',
        sort_order: 4,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 5,
        name: 'Testing',
        color: '#14b8a6',
        description: 'Testing related',
        category: 'Type',
        sort_order: 5,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 6,
        name: 'Refactor',
        color: '#8b5cf6',
        description: 'Code refactoring',
        category: 'Type',
        sort_order: 6,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 7,
        name: 'Urgent',
        color: '#dc2626',
        description: 'Requires immediate attention',
        category: 'Priority',
        sort_order: 7,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 8,
        name: 'Blocked',
        color: '#f97316',
        description: 'Blocked by another task',
        category: 'Workflow',
        sort_order: 8,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 9,
        name: 'NeedsReview',
        color: '#eab308',
        description: 'Needs code review',
        category: 'Workflow',
        sort_order: 9,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 10,
        name: 'InReview',
        color: '#06b6d4',
        description: 'Currently being reviewed',
        category: 'Workflow',
        sort_order: 10,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 11,
        name: 'Approved',
        color: '#10b981',
        description: 'Approved and ready',
        category: 'Workflow',
        sort_order: 11,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
    {
        id: 12,
        name: 'Other',
        color: '#6b7280',
        description: 'Other/Miscellaneous',
        category: 'Other',
        sort_order: 99,
        is_active: true,
        created_at: '',
        updated_at: '',
    },
];

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    table: Table<TData>;
}

export function DataTableRowActions<TData>({
    row,
    table,
}: DataTableRowActionsProps<TData>) {
    const task = row.original as Task;
    const taskLabels = task.labels || [];

    const isLabelSelected = (labelId: number) => {
        return taskLabels.some((l) => l.id === labelId);
    };

    const toggleLabel = (label: Label) => {
        let newLabels: Label[];

        if (isLabelSelected(label.id)) {
            newLabels = taskLabels.filter((l) => l.id !== label.id);
        } else {
            newLabels = [...taskLabels, label];
        }

        // Call the updateData function from table meta
        const meta = table.options.meta as {
            updateData?: (taskId: number, newLabels: Label[]) => void;
        };
        if (meta?.updateData) {
            meta.updateData(task.id, newLabels);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem>
                    <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Labels
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-[200px]">
                        {AVAILABLE_LABELS.map((label) => (
                            <DropdownMenuItem
                                key={label.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleLabel(label);
                                }}
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    checked={isLabelSelected(label.id)}
                                    className="h-4 w-4"
                                />
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                />
                                <span>{label.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Alias for backward compatibility
export { DataTableRowActions as TaskDataTableRowActions };

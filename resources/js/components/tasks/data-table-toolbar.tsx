import { Table } from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    Circle,
    CircleCheck,
    CircleDot,
    CircleX,
    Plus,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface TaskDataTableToolbarProps<TData> {
    table: Table<TData>;
}

const statusIcons = {
    pending: CircleDot,
    in_progress: Circle,
    completed: CircleCheck,
    cancelled: CircleX,
};

const priorityIcons = {
    low: ArrowDown,
    medium: Circle,
    high: ArrowUp,
};

export function TaskDataTableToolbar<TData>({
    table,
}: TaskDataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    const statuses = Object.entries(TASK_STATUSES).map(([value, config]) => ({
        label: config.label,
        value: value,
        icon: statusIcons[value as keyof typeof TASK_STATUSES],
    }));

    const priorities = Object.entries(TASK_PRIORITIES).map(
        ([value, config]) => ({
            label: config.label,
            value: value,
            icon: priorityIcons[value as keyof typeof TASK_PRIORITIES],
        }),
    );

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input
                    placeholder="Filter tasks..."
                    value={
                        (table
                            .getColumn('title')
                            ?.getFilterValue() as string) ?? ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('title')
                            ?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn('status') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('status')}
                        title="Status"
                        options={statuses}
                    />
                )}
                {table.getColumn('priority') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('priority')}
                        title="Priority"
                        options={priorities}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                <DataTableViewOptions table={table} />
                <Button size="sm" className="gap-2">
                    <Plus className="size-4" />
                    Add Task
                </Button>
            </div>
        </div>
    );
}

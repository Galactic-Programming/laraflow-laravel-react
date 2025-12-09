import { ColumnDef } from '@tanstack/react-table';
import {
    ArrowDown,
    ArrowUp,
    Circle,
    CircleCheck,
    CircleDot,
    CircleX,
} from 'lucide-react';

import { LabelList } from '@/components/labels';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, TASK_PRIORITIES, TASK_STATUSES } from '@/types/task';

import { DataTableColumnHeader } from './data-table-column-header';
import { TaskDataTableRowActions } from './data-table-row-actions';

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

export function getTaskColumns(): ColumnDef<Task>[] {
    return [
        {
            id: 'select',
            header: () => <Checkbox className="translate-y-[2px]" />,
            cell: () => <Checkbox className="translate-y-[2px]" />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'id',
            header: () => <div className="w-[80px] font-medium">Task</div>,
            cell: ({ row }) => {
                const taskCode = `TASK-${row.getValue('id')}`;
                return (
                    <div className="flex justify-start">
                        <div className="w-[80px] font-mono text-sm font-semibold text-muted-foreground">
                            {taskCode}
                        </div>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
        {
            id: 'title',
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row, table }) => {
                // Get fresh data from table state instead of row.original
                const rowData = table.options.data[row.index] as Task;
                const labels = rowData?.labels || [];
                return (
                    <div className="flex max-w-[600px] min-w-[300px] items-start gap-2">
                        {labels.length > 0 && (
                            <div className="flex shrink-0 items-center gap-1">
                                <LabelList labels={labels} maxVisible={3} />
                            </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate font-medium">
                                {row.getValue('title')}
                            </span>
                            {rowData?.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {rowData.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
            enableHiding: true,
            enableSorting: true,
            size: 500,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = row.getValue(
                    'status',
                ) as keyof typeof TASK_STATUSES;
                const StatusIcon = statusIcons[status];
                const statusConfig = TASK_STATUSES[status];

                if (!statusConfig) {
                    return null;
                }

                return (
                    <div className="flex w-[120px] items-center gap-2">
                        <StatusIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm">{statusConfig.label}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
            enableHiding: true,
            size: 120,
        },
        {
            accessorKey: 'priority',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Priority" />
            ),
            cell: ({ row }) => {
                const priority = row.getValue(
                    'priority',
                ) as keyof typeof TASK_PRIORITIES;
                const PriorityIcon = priorityIcons[priority];
                const priorityConfig = TASK_PRIORITIES[priority];

                if (!priorityConfig) {
                    return null;
                }

                return (
                    <div className="flex w-[100px] items-center gap-2">
                        <PriorityIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm">{priorityConfig.label}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
            enableHiding: true,
            size: 100,
        },
        {
            id: 'actions',
            header: () => <div className="w-[50px]"></div>,
            cell: ({ row, table }) => (
                <div className="flex justify-end">
                    <TaskDataTableRowActions row={row} table={table} />
                </div>
            ),
            size: 50,
            enableHiding: false,
        },
    ];
}

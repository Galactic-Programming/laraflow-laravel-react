import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { priorities, statuses } from '../data/data.js';
import { Task } from '../data/schema';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';

export const columns: ColumnDef<Task>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Task" />
        ),
        cell: ({ row }) => (
            <div className="w-[80px]">
                TASK-{String(row.getValue('id')).padStart(2, '0')}
            </div>
        ),
        enableHiding: false,
         enableSorting: false
        ,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
       
        cell: ({ row }) => {
            // Get first label from labels array if exists
            const taskLabels = row.original.labels || [];
            const firstLabel = taskLabels.length > 0 ? taskLabels[0] : null;

            return (
                <div className="flex gap-2">
                    {firstLabel && (
                        <Badge
                            variant="outline"
                            style={{
                                borderColor: firstLabel.color,
                                color: firstLabel.color,
                            }}
                        >
                            {firstLabel.name}
                        </Badge>
                    )}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue('title')}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = statuses.find(
                (status) => status.value === row.getValue('status'),
            );

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center gap-2">
                    {status.icon && (
                        <status.icon className="size-4 text-muted-foreground" />
                    )}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'priority',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Priority" />
        ),
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue('priority'),
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center gap-2">
                    {priority.icon && (
                        <priority.icon className="size-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <div className="text-right">
                <DataTableRowActions row={row} />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

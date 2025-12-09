import {
    getTaskColumns,
    TaskDataTable,
    TaskDataTableToolbar,
} from '@/components/tasks';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Task } from '@/types/task';
import { Head } from '@inertiajs/react';
import {
    ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { CheckSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    tasks: {
        data: Task[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        priority?: string;
    };
}

export default function TasksIndex({ tasks, filters = {} }: Props) {
    const { t } = useTranslations();
    const [mounted, setMounted] = useState(false);
    const [taskData, setTaskData] = useState<Task[]>(tasks.data);
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    // Update taskData when tasks prop changes
    useEffect(() => {
        setTaskData(tasks.data);
    }, [tasks.data]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.tasks', 'Tasks'),
            href: '/tasks',
        },
    ];

    const columns = useMemo(() => getTaskColumns(), []);

    const table = useReactTable({
        data: taskData,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 25,
            },
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        meta: {
            updateData: (rowIndex: number, columnId: string, value: any) => {
                setTaskData((old) =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...row,
                                [columnId]: value,
                            };
                        }
                        return row;
                    }),
                );
            },
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.tasks', 'Tasks')} />

            <div
                className={`flex h-full flex-1 flex-col p-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Hero Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}
                        >
                            <CheckSquare className="size-6" />
                        </div>
                        <div>
                            <h1
                                className={`text-2xl font-bold transition-all delay-100 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t('nav.tasks', 'Tasks')}
                            </h1>
                            <p
                                className={`text-sm text-muted-foreground transition-all delay-200 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t(
                                    'tasks.subtitle',
                                    'Manage and track your tasks',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar Section */}
                <div
                    className={`mb-4 transition-all delay-300 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    <TaskDataTableToolbar table={table} />
                </div>

                {/* Data Table Section */}
                <div
                    className={`overflow-hidden rounded-xl border bg-card shadow-lg transition-all delay-400 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    <TaskDataTable columns={columns} data={taskData} />
                </div>

                {/* Pagination Info */}
                {tasks.last_page > 1 && (
                    <div
                        className={`mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all delay-500 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        <span>
                            Page {tasks.current_page} of {tasks.last_page}
                        </span>
                        <span>•</span>
                        <span>
                            {tasks.total}{' '}
                            {t('tasks.total_tasks', 'total tasks')}
                        </span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

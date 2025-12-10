import { Task } from '@/components/data/schema';
import { columns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface TasksPageProps {
    tasks: {
        data: Task[];
        links: any;
        meta: any;
    };
    filters?: {
        search?: string;
        status?: string | string[];
        priority?: string | string[];
        per_page?: number;
        sort?: string;
        order?: string;
    };
}

export default function TasksPage({ tasks, filters }: TasksPageProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
    ];

    const handleFilterChange = useCallback(
        (newFilters: Record<string, any>) => {
            router.get(
                '/tasks',
                {
                    ...filters,
                    ...newFilters,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: false,
                },
            );
        },
        [filters],
    );

    const handleRowClick = useCallback((task: Task) => {
        setSelectedTask(task);
        setIsDetailSheetOpen(true);
    }, []);

    // Check if tasks has pagination data directly or in meta
    const paginationData = tasks?.meta
        ? {
              pageIndex: tasks.meta.current_page - 1,
              pageSize: tasks.meta.per_page,
              pageCount: tasks.meta.last_page,
              total: tasks.meta.total,
          }
        : (tasks as any)?.current_page
          ? {
                pageIndex: (tasks as any).current_page - 1,
                pageSize: (tasks as any).per_page || 10,
                pageCount: (tasks as any).last_page || 1,
                total: (tasks as any).total || 0,
            }
          : undefined;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    data={tasks?.data || []}
                    columns={columns}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onRowClick={handleRowClick}
                    pagination={paginationData}
                />
            </div>

            <TaskDetailSheet
                task={selectedTask}
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
            />
        </AppLayout>
    );
}

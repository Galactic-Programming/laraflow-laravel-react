import { Task } from '@/components/data/schema';
import { columns } from '@/components/tasks/columns';
import { DataTable } from '@/components/tasks/data-table';
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ListTodo } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
    const { t } = useTranslations();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('tasks.title', 'Tasks'),
            href: '/tasks',
        },
    ];

    useEffect(() => {
        // Trigger mount animation after a small delay for smoother entrance
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

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
            <Head title={t('tasks.title', 'Tasks')} />
            <div
                className={`flex h-full flex-1 flex-col p-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Hero Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}
                        >
                            <ListTodo className="size-6" />
                        </div>
                        <div>
                            <h1
                                className={`text-2xl font-bold transition-all delay-100 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t('tasks.title', 'Tasks')}
                            </h1>
                            <p
                                className={`text-sm text-muted-foreground transition-all delay-200 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t(
                                    'tasks.subtitle',
                                    'Track and manage your tasks efficiently',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div
                    className={`flex-1 transition-all delay-300 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    <DataTable
                        data={tasks?.data || []}
                        columns={columns}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onRowClick={handleRowClick}
                        pagination={paginationData}
                    />
                </div>
            </div>

            <TaskDetailSheet
                task={selectedTask}
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
            />
        </AppLayout>
    );
}

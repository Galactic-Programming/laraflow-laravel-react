import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Briefcase,
    Calendar,
    ChartBar,
    Check,
    ChevronDown,
    Code,
    Database,
    FileText,
    Folder,
    Globe,
    Kanban,
    Layers,
    Layout,
    Lightbulb,
    MessageSquare,
    MoreHorizontal,
    Package,
    PenTool,
    Plus,
    Rocket,
    Server,
    Settings,
    ShoppingCart,
    Smartphone,
    Table,
    Target,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Column configuration
interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    required?: boolean; // Task column is always required
}

const defaultColumns: ColumnConfig[] = [
    { id: 'task', label: 'Task', visible: true, required: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'priority', label: 'Priority', visible: true },
    { id: 'dueDate', label: 'Due date', visible: true },
    { id: 'assignee', label: 'Assignee', visible: true },
    { id: 'createdAt', label: 'Created', visible: false },
    { id: 'completedAt', label: 'Completed', visible: false },
    { id: 'creator', label: 'Created by', visible: false },
];

export interface Task {
    id: number;
    task_list_id: number;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    position: number;
    due_date?: string;
    completed_at?: string;
    assigned_to?: number;
    created_by: number;
    subtasks_completed?: number;
    subtasks_total?: number;
}

export interface TaskList {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    color: string;
    position: number;
    tasks: Task[];
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    status: 'active' | 'archived' | 'completed';
    visibility: 'private' | 'public';
    due_date?: string;
    task_lists?: TaskList[];
    created_at?: string;
    updated_at?: string;
}

interface Props {
    project: Project;
}

type ViewMode = 'table' | 'kanban';

const projectIcons: { name: string; icon: LucideIcon }[] = [
    { name: 'folder', icon: Folder },
    { name: 'briefcase', icon: Briefcase },
    { name: 'code', icon: Code },
    { name: 'rocket', icon: Rocket },
    { name: 'target', icon: Target },
    { name: 'lightbulb', icon: Lightbulb },
    { name: 'users', icon: Users },
    { name: 'globe', icon: Globe },
    { name: 'layers', icon: Layers },
    { name: 'layout', icon: Layout },
    { name: 'package', icon: Package },
    { name: 'database', icon: Database },
    { name: 'server', icon: Server },
    { name: 'smartphone', icon: Smartphone },
    { name: 'shopping-cart', icon: ShoppingCart },
    { name: 'pen-tool', icon: PenTool },
    { name: 'file-text', icon: FileText },
    { name: 'book-open', icon: BookOpen },
    { name: 'message-square', icon: MessageSquare },
    { name: 'chart-bar', icon: ChartBar },
];

const getProjectIcon = (iconName?: string): LucideIcon => {
    if (!iconName) return Folder;
    const found = projectIcons.find((i) => i.name === iconName);
    return found?.icon ?? Folder;
};

// Mock data for demonstration
const mockTaskLists: TaskList[] = [
    {
        id: 1,
        project_id: 1,
        name: 'Active tasks',
        color: '#3b82f6',
        position: 0,
        tasks: [
            {
                id: 1,
                task_list_id: 1,
                title: 'Design homepage mockup',
                priority: 'high',
                status: 'in_progress',
                position: 0,
                due_date: '2025-12-10',
                assigned_to: 1,
                created_by: 1,
                subtasks_completed: 2,
                subtasks_total: 5,
            },
            {
                id: 2,
                task_list_id: 1,
                title: 'Set up database schema',
                priority: 'medium',
                status: 'pending',
                position: 1,
                created_by: 1,
            },
            {
                id: 3,
                task_list_id: 1,
                title: 'Implement authentication',
                priority: 'high',
                status: 'in_progress',
                position: 2,
                due_date: '2025-12-05',
                assigned_to: 1,
                created_by: 1,
            },
        ],
    },
    {
        id: 2,
        project_id: 1,
        name: 'Completed',
        color: '#22c55e',
        position: 1,
        tasks: [
            {
                id: 4,
                task_list_id: 2,
                title: 'Project setup',
                priority: 'low',
                status: 'completed',
                position: 0,
                completed_at: '2025-12-01',
                created_by: 1,
            },
        ],
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return '#22c55e';
        case 'in_progress':
            return '#3b82f6';
        case 'cancelled':
            return '#ef4444';
        default:
            return '#a855f7'; // pending - purple like "New task"
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'in_progress':
            return 'In Progress';
        case 'cancelled':
            return 'Cancelled';
        default:
            return 'New task';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return '#ef4444';
        case 'medium':
            return '#f59e0b';
        case 'low':
            return '#22c55e';
        default:
            return '#6b7280';
    }
};

export default function ProjectShow({ project }: Props) {
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [previousView, setPreviousView] = useState<ViewMode>('table');
    const [isViewTransitioning, setIsViewTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [expandedLists, setExpandedLists] = useState<number[]>(
        mockTaskLists.map((l) => l.id),
    );
    const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as
            | 'pending'
            | 'in_progress'
            | 'completed'
            | 'cancelled',
        task_list_id: mockTaskLists[0]?.id || 1,
        due_date: '',
    });
    const ProjectIcon = getProjectIcon(project.icon);

    const visibleColumns = columns.filter((col) => col.visible);
    const gridCols = `2fr ${visibleColumns
        .slice(1)
        .map(() => '1fr')
        .join(' ')}`;

    const toggleColumn = (columnId: string) => {
        setColumns((prev) =>
            prev.map((col) =>
                col.id === columnId && !col.required
                    ? { ...col, visible: !col.visible }
                    : col,
            ),
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Add keyframes animation
    useEffect(() => {
        const styleId = 'project-show-animations';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideInFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideInFromLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const toggleList = (listId: number) => {
        setExpandedLists((prev) =>
            prev.includes(listId)
                ? prev.filter((id) => id !== listId)
                : [...prev, listId],
        );
    };

    const taskLists = project.task_lists ?? mockTaskLists;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.name} />

            <div
                className={`flex h-full flex-1 flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Header */}
                <div className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/projects"
                                className="group flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                            </Link>
                            <div
                                className={`flex size-10 items-center justify-center rounded-lg text-white transition-transform duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}
                                style={{ backgroundColor: project.color }}
                            >
                                <ProjectIcon className="size-5" />
                            </div>
                            <div>
                                <h1
                                    className={`text-lg font-semibold ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                                    style={{
                                        transition:
                                            'transform 500ms, opacity 500ms',
                                        transitionDelay: '100ms',
                                    }}
                                >
                                    {project.name}
                                </h1>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div
                            className={`flex items-center gap-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{
                                transition: 'transform 500ms, opacity 500ms',
                                transitionDelay: '300ms',
                            }}
                        >
                            <ToggleGroup
                                type="single"
                                value={viewMode}
                                onValueChange={(value) => {
                                    if (value && value !== viewMode) {
                                        setPreviousView(viewMode);
                                        setIsViewTransitioning(true);
                                        setTimeout(() => {
                                            setViewMode(value as ViewMode);
                                            setTimeout(() => {
                                                setIsViewTransitioning(false);
                                            }, 50);
                                        }, 250);
                                    }
                                }}
                            >
                                <ToggleGroupItem
                                    value="table"
                                    aria-label="Table view"
                                    className="gap-2 px-3"
                                >
                                    <Table className="size-4" />
                                    <span className="hidden sm:inline">
                                        Table
                                    </span>
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="kanban"
                                    aria-label="Kanban view"
                                    className="gap-2 px-3"
                                >
                                    <Kanban className="size-4" />
                                    <span className="hidden sm:inline">
                                        Board
                                    </span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div
                    className={`flex-1 overflow-auto ${
                        mounted ? '' : 'translate-y-8 opacity-0'
                    } ${
                        isViewTransitioning
                            ? 'pointer-events-none opacity-0'
                            : 'opacity-100'
                    }`}
                    style={{
                        transition:
                            'opacity 250ms ease-out, transform 500ms ease-out',
                        transitionDelay: mounted ? '0ms' : '400ms',
                        animation:
                            !isViewTransitioning && mounted
                                ? `${viewMode === 'kanban' ? 'slideInFromRight' : 'slideInFromLeft'} 350ms cubic-bezier(0.16, 1, 0.3, 1)`
                                : 'none',
                    }}
                    key={viewMode}
                >
                    {viewMode === 'table' ? (
                        <div className="min-w-[600px]">
                            {/* Table Header */}
                            <div
                                className="sticky top-0 z-10 grid border-b bg-background text-sm text-muted-foreground"
                                style={{
                                    gridTemplateColumns: `${gridCols} 40px`,
                                }}
                            >
                                {visibleColumns.map((col) => (
                                    <div
                                        key={col.id}
                                        className={`flex items-center gap-2 py-3 font-medium ${col.id === 'task' ? 'px-4' : 'px-3'}`}
                                    >
                                        {col.id === 'task' && (
                                            <button
                                                onClick={() => {
                                                    if (
                                                        expandedLists.length > 0
                                                    ) {
                                                        setExpandedLists([]);
                                                    } else {
                                                        setExpandedLists(
                                                            taskLists.map(
                                                                (l) => l.id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                                className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                            >
                                                <ChevronDown
                                                    className={`size-4 transition-transform duration-200 ${
                                                        expandedLists.length > 0
                                                            ? 'rotate-0'
                                                            : '-rotate-90'
                                                    }`}
                                                />
                                            </button>
                                        )}
                                        {col.label}
                                        {col.id === 'task' && (
                                            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs">
                                                {taskLists.reduce(
                                                    (acc, list) =>
                                                        acc + list.tasks.length,
                                                    0,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                <div className="flex items-center py-3 pr-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex size-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                                <Settings className="size-[18px]" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="end"
                                            className="w-48 p-2"
                                        >
                                            <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                                                Toggle columns
                                            </div>
                                            {columns.map((column) => (
                                                <button
                                                    key={column.id}
                                                    onClick={() =>
                                                        toggleColumn(column.id)
                                                    }
                                                    disabled={column.required}
                                                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <div
                                                        className={`flex size-4 items-center justify-center rounded border ${
                                                            column.visible
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-muted-foreground/30'
                                                        }`}
                                                    >
                                                        {column.visible && (
                                                            <Check className="size-3" />
                                                        )}
                                                    </div>
                                                    <span>{column.label}</span>
                                                </button>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Quick Add Task Row */}
                            <button
                                onClick={() => setIsCreateTaskOpen(true)}
                                className="group flex w-full items-center gap-2 border-b px-4 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/30 hover:text-foreground"
                            >
                                <Plus className="size-4 transition-transform duration-150 group-hover:rotate-90" />
                                <span>Create task</span>
                            </button>

                            {/* Task Lists */}
                            <div>
                                {taskLists.map((list, listIndex) => (
                                    <div
                                        key={list.id}
                                        style={{
                                            animation: mounted
                                                ? `fadeSlideIn 400ms ease-out ${listIndex * 100 + 200}ms both`
                                                : 'none',
                                        }}
                                    >
                                        {/* List Header */}
                                        <button
                                            onClick={() => toggleList(list.id)}
                                            className="flex w-full items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-left transition-all duration-200 hover:bg-muted/50"
                                        >
                                            <ChevronDown
                                                className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                                    expandedLists.includes(
                                                        list.id,
                                                    )
                                                        ? 'rotate-0'
                                                        : '-rotate-90'
                                                }`}
                                            />
                                            <span className="text-sm font-medium">
                                                {list.name}
                                            </span>
                                            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                                                {list.tasks.length}
                                            </span>
                                        </button>

                                        {/* Tasks */}
                                        {expandedLists.includes(list.id) && (
                                            <div className="animate-in duration-200 fade-in slide-in-from-top-2">
                                                {list.tasks.map(
                                                    (task, taskIndex) => (
                                                        <div
                                                            key={task.id}
                                                            className="group grid border-b transition-all duration-150 hover:bg-muted/30"
                                                            style={{
                                                                gridTemplateColumns: `${gridCols} 40px`,
                                                                animation: `fadeSlideIn 300ms ease-out ${taskIndex * 50}ms both`,
                                                            }}
                                                        >
                                                            {/* Task Title - Always visible */}
                                                            <div className="flex items-center gap-3 px-4 py-3">
                                                                <span
                                                                    className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                                                                >
                                                                    {task.title}
                                                                </span>
                                                                {task.subtasks_total &&
                                                                    task.subtasks_total >
                                                                        0 && (
                                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Check className="size-3" />
                                                                            {
                                                                                task.subtasks_completed
                                                                            }
                                                                            /
                                                                            {
                                                                                task.subtasks_total
                                                                            }
                                                                        </span>
                                                                    )}
                                                            </div>

                                                            {/* Status */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'status',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="size-3 rounded"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    getStatusColor(
                                                                                        task.status,
                                                                                    ),
                                                                            }}
                                                                        />
                                                                        <span className="text-sm">
                                                                            {getStatusLabel(
                                                                                task.status,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Priority */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'priority',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3">
                                                                    {task.priority ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className="size-3 rounded"
                                                                                style={{
                                                                                    backgroundColor:
                                                                                        getPriorityColor(
                                                                                            task.priority,
                                                                                        ),
                                                                                }}
                                                                            />
                                                                            <span className="text-sm capitalize">
                                                                                {
                                                                                    task.priority
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            –
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Due Date */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'dueDate',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                                                                    {task.due_date
                                                                        ? new Date(
                                                                              task.due_date,
                                                                          ).toLocaleDateString(
                                                                              'en-US',
                                                                              {
                                                                                  month: 'short',
                                                                                  day: 'numeric',
                                                                              },
                                                                          )
                                                                        : '–'}
                                                                </div>
                                                            )}

                                                            {/* Assignee */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'assignee',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3">
                                                                    {task.assigned_to ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="size-6">
                                                                                <AvatarImage src="" />
                                                                                <AvatarFallback className="text-xs">
                                                                                    Me
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-sm">
                                                                                Me
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            –
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Created At */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'createdAt',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                                                                    {new Date().toLocaleDateString(
                                                                        'en-US',
                                                                        {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Completed At */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'completedAt',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                                                                    {task.completed_at
                                                                        ? new Date(
                                                                              task.completed_at,
                                                                          ).toLocaleDateString(
                                                                              'en-US',
                                                                              {
                                                                                  month: 'short',
                                                                                  day: 'numeric',
                                                                              },
                                                                          )
                                                                        : '–'}
                                                                </div>
                                                            )}

                                                            {/* Creator */}
                                                            {columns.find(
                                                                (c) =>
                                                                    c.id ===
                                                                    'creator',
                                                            )?.visible && (
                                                                <div className="flex items-center px-3 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Avatar className="size-6">
                                                                            <AvatarImage src="" />
                                                                            <AvatarFallback className="text-xs">
                                                                                Me
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-sm">
                                                                            Me
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Empty cell for settings column alignment */}
                                                            <div />
                                                        </div>
                                                    ),
                                                )}

                                                {/* Add Task Button */}
                                                <button
                                                    onClick={() => {
                                                        setTaskForm((prev) => ({
                                                            ...prev,
                                                            task_list_id:
                                                                list.id,
                                                        }));
                                                        setIsCreateTaskOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="group flex w-full items-center gap-2 border-b px-4 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/30 hover:pl-5 hover:text-foreground"
                                                    style={{
                                                        animation: `fadeSlideIn 300ms ease-out ${list.tasks.length * 50}ms both`,
                                                    }}
                                                >
                                                    <Plus className="size-4 transition-transform duration-150 group-hover:rotate-90" />
                                                    <span>Create task</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Kanban Board - Clean Design */
                        <div className="flex h-full gap-5 overflow-x-auto p-6">
                            {[
                                {
                                    id: 'todo',
                                    name: 'To Do',
                                    color: '#64748b',
                                    count: 0,
                                },
                                {
                                    id: 'progress',
                                    name: 'In Progress',
                                    color: '#3b82f6',
                                    count: 0,
                                },
                                {
                                    id: 'review',
                                    name: 'Review',
                                    color: '#f59e0b',
                                    count: 0,
                                },
                                {
                                    id: 'done',
                                    name: 'Done',
                                    color: '#22c55e',
                                    count: 0,
                                },
                            ].map((column, index) => (
                                <div
                                    key={column.id}
                                    className="group/column flex w-80 shrink-0 flex-col"
                                    style={{
                                        animation: mounted
                                            ? `fadeSlideIn 400ms ease-out ${index * 80}ms both`
                                            : 'none',
                                    }}
                                >
                                    {/* Column Header */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="size-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        column.color,
                                                }}
                                            />
                                            <h3 className="text-sm font-semibold text-foreground">
                                                {column.name}
                                            </h3>
                                            <span className="text-sm text-muted-foreground">
                                                {column.count}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/column:opacity-100">
                                            <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                                <Plus className="size-4" />
                                            </button>
                                            <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                                <MoreHorizontal className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cards Container */}
                                    <div className="relative flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl bg-muted/40 p-2.5">
                                        {/* Add task button - shows on hover in center */}
                                        <button className="absolute inset-0 m-2.5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-transparent text-sm text-muted-foreground opacity-0 transition-all group-hover/column:opacity-100 hover:border-muted-foreground/30 hover:bg-background/50">
                                            <Plus className="size-4" />
                                            <span>Add task</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Column */}
                            <div
                                className="flex w-80 shrink-0 flex-col"
                                style={{
                                    animation: mounted
                                        ? 'fadeSlideIn 400ms ease-out 320ms both'
                                        : 'none',
                                }}
                            >
                                <div className="mb-3 h-7" />
                                <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/25 text-sm text-muted-foreground transition-all hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-foreground">
                                    <Plus className="size-4" />
                                    Add column
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Sheet */}
            <Sheet open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <div className="mx-auto max-w-lg py-6">
                        <SheetHeader className="text-left">
                            <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                                Create new task
                            </SheetTitle>
                            <p className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                Add a new task to {project.name}.
                            </p>
                        </SheetHeader>

                        <form className="mt-10 space-y-8">
                            {/* Title */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Label htmlFor="title" className="text-base">
                                    Task title
                                </Label>
                                <Input
                                    id="title"
                                    value={taskForm.title}
                                    onChange={(e) =>
                                        setTaskForm((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter task title"
                                    className="h-12 text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Description */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '200ms' }}
                            >
                                <Label
                                    htmlFor="description"
                                    className="text-base"
                                >
                                    Description
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={taskForm.description}
                                    onChange={(e) =>
                                        setTaskForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="What needs to be done?"
                                    className="min-h-[120px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Task List - Read only, shows which list the task will be added to */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '300ms' }}
                            >
                                <Label className="text-base">Adding to</Label>
                                {(() => {
                                    const selectedList = taskLists.find(
                                        (l) => l.id === taskForm.task_list_id,
                                    );
                                    return selectedList ? (
                                        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
                                            <div
                                                className="size-4 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        selectedList.color,
                                                }}
                                            />
                                            <span className="font-medium">
                                                {selectedList.name}
                                            </span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Priority */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '400ms' }}
                            >
                                <Label className="text-base">Priority</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTaskForm((prev) => ({
                                                ...prev,
                                                priority: 'low',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            taskForm.priority === 'low'
                                                ? 'border-green-500 bg-green-500/5 shadow-md'
                                                : 'border-border hover:border-green-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-green-500 transition-transform duration-200 ${
                                                taskForm.priority === 'low'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                taskForm.priority === 'low'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            Low
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTaskForm((prev) => ({
                                                ...prev,
                                                priority: 'medium',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            taskForm.priority === 'medium'
                                                ? 'border-amber-500 bg-amber-500/5 shadow-md'
                                                : 'border-border hover:border-amber-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-amber-500 transition-transform duration-200 ${
                                                taskForm.priority === 'medium'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                taskForm.priority === 'medium'
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            Medium
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTaskForm((prev) => ({
                                                ...prev,
                                                priority: 'high',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            taskForm.priority === 'high'
                                                ? 'border-red-500 bg-red-500/5 shadow-md'
                                                : 'border-border hover:border-red-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-red-500 transition-transform duration-200 ${
                                                taskForm.priority === 'high'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                taskForm.priority === 'high'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            High
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '500ms' }}
                            >
                                <Label htmlFor="due_date" className="text-base">
                                    Due date
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={taskForm.due_date}
                                        onChange={(e) =>
                                            setTaskForm((prev) => ({
                                                ...prev,
                                                due_date: e.target.value,
                                            }))
                                        }
                                        className="h-12 pl-12 text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex animate-in gap-4 pt-6 duration-500 fill-mode-both fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: '600ms' }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-md"
                                    onClick={() => setIsCreateTaskOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={!taskForm.title}
                                    onClick={() => {
                                        setIsCreateTaskOpen(false);
                                        setTaskForm({
                                            title: '',
                                            description: '',
                                            priority: 'medium',
                                            status: 'pending',
                                            task_list_id:
                                                mockTaskLists[0]?.id || 1,
                                            due_date: '',
                                        });
                                    }}
                                >
                                    Create task
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

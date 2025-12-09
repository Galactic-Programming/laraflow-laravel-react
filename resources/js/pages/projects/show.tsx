import {
    store as storeTask,
    update as updateTask,
} from '@/actions/App/Http/Controllers/TaskController';
import {
    destroy as destroyTaskList,
    store as storeTaskList,
    update as updateTaskList,
} from '@/actions/App/Http/Controllers/TaskListController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
    MoreVertical,
    Package,
    Palette,
    Pencil,
    PenTool,
    Plus,
    Rocket,
    Search,
    Server,
    Settings,
    ShoppingCart,
    Smartphone,
    Table,
    Target,
    Trash2,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Column configuration
interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    required?: boolean; // Task List column is always required
}

const defaultColumns: ColumnConfig[] = [
    { id: 'task', label: 'Task List', visible: true, required: true },
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
            return 'Pending';
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

// Sortable Task List Row Component
interface SortableTaskListRowProps {
    list: TaskList;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableTaskListRow({
    list,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
}: SortableTaskListRowProps) {
    const { t } = useTranslations();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list.id,
        animateLayoutChanges: () => false,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group/row cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg' : ''}`}
        >
            <div className="flex w-full items-center border-b bg-muted/30 px-4 py-2.5 hover:bg-muted/50">
                {/* Expand/Collapse Button - only the icon area */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="mr-2 flex items-center"
                >
                    <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                    />
                </button>
                {/* Task list name and count - draggable area */}
                <span className="text-sm font-medium">{list.name}</span>
                <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    {list.tasks.length}
                </span>
                {/* Spacer */}
                <div className="flex-1" />
                {/* Dropdown Menu - appears on hover */}
                <div
                    className="opacity-0 transition-opacity group-hover/row:opacity-100"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <MoreVertical className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="mr-2 size-4" />
                                {t('task_lists.edit', 'Edit task list')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                                onClick={onDelete}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('task_lists.delete', 'Delete task list')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

// Sortable Table Task Row Component
interface SortableTableTaskRowProps {
    task: Task;
    listId: number;
    gridCols: string;
    columns: ColumnConfig[];
    getStatusColor: (status: string) => string;
    getStatusLabel: (status: string) => string;
    getPriorityColor: (priority: string) => string;
    getPriorityLabel: (priority: string) => string;
    onEdit: () => void;
    onDelete: () => void;
}

function SortableTableTaskRow({
    task,
    listId,
    gridCols,
    columns,
    getStatusColor,
    getStatusLabel,
    getPriorityColor,
    getPriorityLabel,
    onEdit,
    onDelete,
}: SortableTableTaskRowProps) {
    const { t } = useTranslations();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `table-task-${task.id}`,
        data: {
            type: 'table-task',
            task,
            listId,
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging
            ? 'none'
            : transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 10 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                gridTemplateColumns: `${gridCols} 40px`,
            }}
            {...attributes}
            {...listeners}
            className={`group/task grid cursor-grab border-b pl-6 transition-colors duration-150 hover:bg-muted/30 active:cursor-grabbing ${
                isDragging ? 'bg-muted/50' : ''
            }`}
        >
            {/* Task Title - Always visible */}
            <div className="flex items-center gap-3 px-4 py-3">
                <span
                    className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                >
                    {task.title}
                </span>
                {task.subtasks_total && task.subtasks_total > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Check className="size-3" />
                        {task.subtasks_completed}/{task.subtasks_total}
                    </span>
                )}
            </div>

            {/* Status */}
            {columns.find((c) => c.id === 'status')?.visible && (
                <div className="flex items-center px-3 py-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="size-3 rounded"
                            style={{
                                backgroundColor: getStatusColor(task.status),
                            }}
                        />
                        <span className="text-sm">
                            {getStatusLabel(task.status)}
                        </span>
                    </div>
                </div>
            )}

            {/* Priority */}
            {columns.find((c) => c.id === 'priority')?.visible && (
                <div className="flex items-center px-3 py-3">
                    {task.priority ? (
                        <div className="flex items-center gap-2">
                            <div
                                className="size-3 rounded"
                                style={{
                                    backgroundColor: getPriorityColor(
                                        task.priority,
                                    ),
                                }}
                            />
                            <span className="text-sm">
                                {getPriorityLabel(task.priority)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">–</span>
                    )}
                </div>
            )}

            {/* Due Date */}
            {columns.find((c) => c.id === 'dueDate')?.visible && (
                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                    {task.due_date
                        ? new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                          })
                        : '–'}
                </div>
            )}

            {/* Assignee */}
            {columns.find((c) => c.id === 'assignee')?.visible && (
                <div className="flex items-center px-3 py-3">
                    {task.assigned_to ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xs">
                                    {t('common.me', 'Me')}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                                {t('common.me', 'Me')}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">–</span>
                    )}
                </div>
            )}

            {/* Created At */}
            {columns.find((c) => c.id === 'createdAt')?.visible && (
                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })}
                </div>
            )}

            {/* Completed At */}
            {columns.find((c) => c.id === 'completedAt')?.visible && (
                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                    {task.completed_at
                        ? new Date(task.completed_at).toLocaleDateString(
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
            {columns.find((c) => c.id === 'creator')?.visible && (
                <div className="flex items-center px-3 py-3">
                    <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                                {t('common.me', 'Me')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{t('common.me', 'Me')}</span>
                    </div>
                </div>
            )}

            {/* Actions Menu - appears on hover */}
            <div
                className="flex items-center justify-center opacity-0 transition-opacity group-hover/task:opacity-100"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <MoreVertical className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 size-4" />
                            {t('tasks.edit', 'Edit task')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                            onClick={onDelete}
                        >
                            <Trash2 className="mr-2 size-4" />
                            {t('tasks.delete', 'Delete task')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

// Sortable Task Card Component
interface SortableTaskCardProps {
    task: Task;
    isDragOverlay?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

function SortableTaskCard({
    task,
    isDragOverlay = false,
    onEdit,
    onDelete,
}: SortableTaskCardProps) {
    const { t } = useTranslations();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `task-${task.id}`,
        data: {
            type: 'task',
            task,
        },
    });

    // Helper to get translated status label
    const getTranslatedStatusLabel = (status: string): string => {
        const statusKeyMap: Record<string, string> = {
            completed: 'tasks.status_completed',
            in_progress: 'tasks.status_in_progress',
            cancelled: 'tasks.status_cancelled',
            pending: 'tasks.status_pending',
        };
        const fallbackMap: Record<string, string> = {
            completed: 'Completed',
            in_progress: 'In Progress',
            cancelled: 'Cancelled',
            pending: 'Pending',
        };
        return t(
            statusKeyMap[status] || 'tasks.status_pending',
            fallbackMap[status] || 'Pending',
        );
    };

    // Helper to get translated priority label
    const getTranslatedPriorityLabel = (priority: string): string => {
        const priorityKeyMap: Record<string, string> = {
            low: 'tasks.priority_low',
            medium: 'tasks.priority_medium',
            high: 'tasks.priority_high',
        };
        const fallbackMap: Record<string, string> = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
        };
        return t(
            priorityKeyMap[priority] || 'tasks.priority_medium',
            fallbackMap[priority] || 'Medium',
        );
    };

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (isDragOverlay) {
        return (
            <div className="w-72 cursor-grabbing rounded-lg border bg-background p-3 shadow-xl ring-2 ring-primary/30">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm leading-snug font-medium">
                        {task.title}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                            backgroundColor: `${getStatusColor(task.status)}15`,
                            color: getStatusColor(task.status),
                        }}
                    >
                        {getTranslatedStatusLabel(task.status)}
                    </span>
                    <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                            backgroundColor: `${getPriorityColor(task.priority)}15`,
                            color: getPriorityColor(task.priority),
                        }}
                    >
                        {getTranslatedPriorityLabel(task.priority)}
                    </span>
                    {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            {(() => {
                                const [year, month, day] = task.due_date
                                    .split('-')
                                    .map(Number);
                                const date = new Date(year, month - 1, day);
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            })()}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group/card relative cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                isDragging ? 'opacity-50' : ''
            }`}
        >
            <div className="mb-2 flex items-start gap-2">
                <span className="flex-1 text-sm leading-snug font-medium">
                    {task.title}
                </span>
            </div>
            {/* Actions Menu - appears on hover, positioned on the right center */}
            {onEdit && onDelete && (
                <div
                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover/card:opacity-100"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <MoreVertical className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="mr-2 size-4" />
                                {t('tasks.edit', 'Edit task')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                                onClick={onDelete}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('tasks.delete', 'Delete task')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                        backgroundColor: `${getStatusColor(task.status)}15`,
                        color: getStatusColor(task.status),
                    }}
                >
                    {getTranslatedStatusLabel(task.status)}
                </span>
                <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                        backgroundColor: `${getPriorityColor(task.priority)}15`,
                        color: getPriorityColor(task.priority),
                    }}
                >
                    {getTranslatedPriorityLabel(task.priority)}
                </span>
                {task.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {(() => {
                            const [year, month, day] = task.due_date
                                .split('-')
                                .map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            });
                        })()}
                    </span>
                )}
            </div>
        </div>
    );
}

// Sortable Kanban Column Component
interface SortableKanbanColumnProps {
    list: TaskList & { _listNameMatches?: boolean };
    index: number;
    mounted: boolean;
    onEditColumn: (list: TaskList) => void;
    onDeleteColumn: (listId: number) => void;
    onAddTask: (listId: number) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: number) => void;
}

function SortableKanbanColumn({
    list,
    index,
    mounted,
    onEditColumn,
    onDeleteColumn,
    onAddTask,
    onEditTask,
    onDeleteTask,
}: SortableKanbanColumnProps) {
    const { t } = useTranslations();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                animation:
                    mounted && !isDragging && !transform
                        ? `fadeSlideIn 400ms ease-out ${index * 80}ms both`
                        : 'none',
            }}
            className={`group/column flex w-80 shrink-0 flex-col ${isDragging ? 'rounded-xl shadow-2xl ring-2 shadow-black/20 ring-primary/30' : ''}`}
        >
            {/* Column Header - Draggable */}
            <div
                {...attributes}
                {...listeners}
                className="mb-3 flex cursor-grab items-center justify-between active:cursor-grabbing"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditColumn(list);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="-ml-2 flex items-center gap-2.5 rounded-md px-2 py-1 transition-colors hover:bg-muted"
                >
                    <div
                        className="size-2.5 rounded-full"
                        style={{
                            backgroundColor: list.color,
                        }}
                    />
                    <h3 className="text-sm font-semibold text-foreground">
                        {list.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                        {list.tasks.length}
                    </span>
                </button>
                <div
                    className="flex items-center gap-1 opacity-0 transition-opacity group-hover/column:opacity-100"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => onAddTask(list.id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Plus className="size-4" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <MoreHorizontal className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onEditColumn(list)}
                            >
                                <Pencil className="mr-2 size-4" />
                                {t('task_lists.edit', 'Edit column')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                                onClick={() => onDeleteColumn(list.id)}
                            >
                                <Trash2 className="mr-2 size-4" />
                                {t('task_lists.delete', 'Delete column')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Cards Container */}
            <SortableContext
                items={list.tasks.map((t) => `task-${t.id}`)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    className="relative flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl bg-muted/40 p-2.5"
                    data-list-id={list.id}
                >
                    {list.tasks.length > 0 ? (
                        list.tasks.map((task) => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                onEdit={() => onEditTask(task)}
                                onDelete={() => onDeleteTask(task.id)}
                            />
                        ))
                    ) : (
                        /* Add task button - shows on hover when empty */
                        <button
                            onClick={() => onAddTask(list.id)}
                            className="absolute inset-0 m-2.5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-transparent text-sm text-muted-foreground opacity-0 transition-all group-hover/column:opacity-100 hover:border-muted-foreground/30 hover:bg-background/50"
                        >
                            <Plus className="size-4" />
                            <span>Add task</span>
                        </button>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

export default function ProjectShow({ project }: Props) {
    const { t } = useTranslations();

    // Helper to get translated column labels
    const getColumnLabel = (columnId: string, fallback: string): string => {
        const columnKeyMap: Record<string, string> = {
            task: 'columns.task',
            status: 'columns.status',
            priority: 'columns.priority',
            dueDate: 'columns.due_date',
            assignee: 'columns.assignee',
            createdAt: 'columns.created',
            completedAt: 'columns.completed',
            creator: 'columns.created_by',
        };
        return t(columnKeyMap[columnId] || `columns.${columnId}`, fallback);
    };

    // Helper to get translated status label
    const getTranslatedStatusLabel = (status: string): string => {
        const statusKeyMap: Record<string, string> = {
            completed: 'tasks.status_completed',
            in_progress: 'tasks.status_in_progress',
            cancelled: 'tasks.status_cancelled',
            pending: 'tasks.status_pending',
        };
        const fallbackMap: Record<string, string> = {
            completed: 'Completed',
            in_progress: 'In Progress',
            cancelled: 'Cancelled',
            pending: 'Pending',
        };
        return t(
            statusKeyMap[status] || 'tasks.status_pending',
            fallbackMap[status] || 'Pending',
        );
    };

    // Helper to get translated priority label
    const getTranslatedPriorityLabel = (priority: string): string => {
        const priorityKeyMap: Record<string, string> = {
            low: 'tasks.priority_low',
            medium: 'tasks.priority_medium',
            high: 'tasks.priority_high',
        };
        const fallbackMap: Record<string, string> = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
        };
        return t(
            priorityKeyMap[priority] || 'tasks.priority_medium',
            fallbackMap[priority] || 'Medium',
        );
    };

    // Get taskLists first before using in state
    const taskLists = project.task_lists ?? mockTaskLists;

    // Get initial view from URL query parameter
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialView = (urlParams.get('view') as ViewMode) || 'table';

    const [viewMode, setViewMode] = useState<ViewMode>(
        initialView === 'kanban' ? 'kanban' : 'table',
    );
    const [previousView, setPreviousView] = useState<ViewMode>(
        initialView === 'kanban' ? 'kanban' : 'table',
    );
    const [isViewTransitioning, setIsViewTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLists, setExpandedLists] = useState<number[]>(
        taskLists.map((l) => l.id),
    );

    // Load columns config from localStorage
    const getInitialColumns = (): ColumnConfig[] => {
        if (typeof window === 'undefined') return defaultColumns;
        const saved = localStorage.getItem(`project-${project.id}-columns`);
        if (saved) {
            try {
                const savedColumns = JSON.parse(saved) as ColumnConfig[];
                // Merge with default columns to handle new columns added later
                return defaultColumns.map((defaultCol) => {
                    const savedCol = savedColumns.find(
                        (s) => s.id === defaultCol.id,
                    );
                    return savedCol
                        ? { ...defaultCol, visible: savedCol.visible }
                        : defaultCol;
                });
            } catch {
                return defaultColumns;
            }
        }
        return defaultColumns;
    };

    const [columns, setColumns] = useState<ColumnConfig[]>(getInitialColumns);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
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
    const [columnForm, setColumnForm] = useState({
        name: '',
        description: '',
        color: '#3b82f6',
    });
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);
    const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
    const [deleteColumnId, setDeleteColumnId] = useState<number | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<number | null>(
        null,
    );
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
    const [orderedTaskLists, setOrderedTaskLists] =
        useState<TaskList[]>(taskLists);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isDraggingTaskList, setIsDraggingTaskList] = useState(false);
    const skipSyncRef = useRef(false);
    const ProjectIcon = getProjectIcon(project.icon);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = String(active.id);

        if (activeId.startsWith('task-')) {
            const taskId = parseInt(activeId.replace('task-', ''));
            // Find the task in orderedTaskLists
            for (const list of orderedTaskLists) {
                const task = list.tasks.find((t) => t.id === taskId);
                if (task) {
                    setActiveTask(task);
                    break;
                }
            }
        }
    };

    // Handle drag over (for moving tasks between columns)
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Only handle task dragging
        if (!activeId.startsWith('task-')) return;

        const activeTaskId = parseInt(activeId.replace('task-', ''));

        // Find source list
        let sourceListId: number | null = null;
        let sourceTaskIndex: number = -1;

        for (const list of orderedTaskLists) {
            const taskIndex = list.tasks.findIndex(
                (t) => t.id === activeTaskId,
            );
            if (taskIndex !== -1) {
                sourceListId = list.id;
                sourceTaskIndex = taskIndex;
                break;
            }
        }

        if (sourceListId === null) return;

        // Determine destination list
        let destListId: number | null = null;

        if (overId.startsWith('task-')) {
            // Dropping on another task
            const overTaskId = parseInt(overId.replace('task-', ''));
            for (const list of orderedTaskLists) {
                if (list.tasks.some((t) => t.id === overTaskId)) {
                    destListId = list.id;
                    break;
                }
            }
        } else {
            // Check if dropping on a column
            const listId = parseInt(overId);
            if (orderedTaskLists.some((l) => l.id === listId)) {
                destListId = listId;
            }
        }

        if (destListId === null || sourceListId === destListId) return;

        // Move task to new list (optimistic update)
        setOrderedTaskLists((prev) => {
            const newLists = prev.map((list) => ({
                ...list,
                tasks: [...list.tasks],
            }));

            const sourceList = newLists.find((l) => l.id === sourceListId);
            const destList = newLists.find((l) => l.id === destListId);

            if (!sourceList || !destList) return prev;

            const [movedTask] = sourceList.tasks.splice(sourceTaskIndex, 1);
            movedTask.task_list_id = destListId!;
            destList.tasks.push(movedTask);

            return newLists;
        });
    };

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Handle task drag
        if (activeId.startsWith('task-')) {
            const activeTaskId = parseInt(activeId.replace('task-', ''));

            // Find the task and its list
            let sourceList: TaskList | null = null;
            let task: Task | null = null;

            for (const list of orderedTaskLists) {
                const foundTask = list.tasks.find((t) => t.id === activeTaskId);
                if (foundTask) {
                    sourceList = list;
                    task = foundTask;
                    break;
                }
            }

            if (!sourceList || !task) return;

            // Determine target position and list
            let targetListId = sourceList.id;
            let targetPosition = task.position;

            if (overId.startsWith('task-')) {
                const overTaskId = parseInt(overId.replace('task-', ''));
                for (const list of orderedTaskLists) {
                    const overTaskIndex = list.tasks.findIndex(
                        (t) => t.id === overTaskId,
                    );
                    if (overTaskIndex !== -1) {
                        targetListId = list.id;
                        targetPosition = overTaskIndex;
                        break;
                    }
                }
            } else {
                // Dropped on column
                const listId = parseInt(overId);
                const targetList = orderedTaskLists.find(
                    (l) => l.id === listId,
                );
                if (targetList) {
                    targetListId = listId;
                    targetPosition = targetList.tasks.length;
                }
            }

            // Update local state
            setOrderedTaskLists((prev) => {
                const newLists = prev.map((list) => ({
                    ...list,
                    tasks: [...list.tasks],
                }));

                // Find and remove task from source
                const srcList = newLists.find((l) =>
                    l.tasks.some((t) => t.id === activeTaskId),
                );
                if (!srcList) return prev;

                const taskIndex = srcList.tasks.findIndex(
                    (t) => t.id === activeTaskId,
                );
                const [movedTask] = srcList.tasks.splice(taskIndex, 1);

                // Add to destination
                const destList = newLists.find((l) => l.id === targetListId);
                if (!destList) return prev;

                movedTask.task_list_id = targetListId;
                destList.tasks.splice(targetPosition, 0, movedTask);

                // Update positions
                destList.tasks.forEach((t, i) => {
                    t.position = i;
                });

                return newLists;
            });

            // Skip sync from props
            skipSyncRef.current = true;
            setTimeout(() => {
                skipSyncRef.current = false;
            }, 1000);

            // Save to backend
            fetch(
                updateTask.url({
                    project: project.id,
                    taskList: sourceList.id,
                    task: activeTaskId,
                }),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )?.content || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        task_list_id: targetListId,
                        position: targetPosition,
                    }),
                },
            );

            return;
        }

        // Handle column drag (existing logic)
        if (active.id !== over.id) {
            const oldIndex = orderedTaskLists.findIndex(
                (item) => item.id === active.id,
            );
            const newIndex = orderedTaskLists.findIndex(
                (item) => item.id === over.id,
            );

            if (oldIndex === -1 || newIndex === -1) return;

            // Get the moved item before reordering
            const movedItem = orderedTaskLists[oldIndex];

            // Skip sync from props for a while to prevent flash
            skipSyncRef.current = true;
            setTimeout(() => {
                skipSyncRef.current = false;
            }, 1000);

            // Immediately update UI (optimistic update)
            const newOrder = arrayMove(orderedTaskLists, oldIndex, newIndex);
            setOrderedTaskLists(newOrder);

            // Send update to backend silently (no page reload)
            fetch(
                updateTaskList.url({
                    project: project.id,
                    taskList: movedItem.id,
                }),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )?.content || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ position: newIndex }),
                },
            );
        }
    };

    // Handle Table drag start
    const handleTableDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = String(active.id);

        if (activeId.startsWith('table-task-')) {
            const taskId = parseInt(activeId.replace('table-task-', ''));
            for (const list of orderedTaskLists) {
                const task = list.tasks.find((t) => t.id === taskId);
                if (task) {
                    setActiveTask(task);
                    break;
                }
            }
        } else {
            // Kéo task list
            setIsDraggingTaskList(true);
        }
    };

    // Handle Table drag end
    const handleTableDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveTask(null);
        setIsDraggingTaskList(false);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Handle table task drag
        if (activeId.startsWith('table-task-')) {
            const activeTaskId = parseInt(activeId.replace('table-task-', ''));

            // Find the task and its list
            let sourceList: TaskList | null = null;
            let sourceTaskIndex: number = -1;

            for (const list of orderedTaskLists) {
                const taskIndex = list.tasks.findIndex(
                    (t) => t.id === activeTaskId,
                );
                if (taskIndex !== -1) {
                    sourceList = list;
                    sourceTaskIndex = taskIndex;
                    break;
                }
            }

            if (!sourceList || sourceTaskIndex === -1) return;

            // Determine target position
            let targetListId = sourceList.id;
            let targetPosition = sourceTaskIndex;

            if (overId.startsWith('table-task-')) {
                const overTaskId = parseInt(overId.replace('table-task-', ''));
                for (const list of orderedTaskLists) {
                    const overTaskIndex = list.tasks.findIndex(
                        (t) => t.id === overTaskId,
                    );
                    if (overTaskIndex !== -1) {
                        targetListId = list.id;
                        targetPosition = overTaskIndex;
                        break;
                    }
                }
            }

            // Only proceed if position changed
            if (
                targetListId === sourceList.id &&
                targetPosition === sourceTaskIndex
            )
                return;

            // Update local state
            setOrderedTaskLists((prev) => {
                const newLists = prev.map((list) => ({
                    ...list,
                    tasks: [...list.tasks],
                }));

                // Find and remove task from source
                const srcList = newLists.find((l) => l.id === sourceList!.id);
                if (!srcList) return prev;

                const [movedTask] = srcList.tasks.splice(sourceTaskIndex, 1);

                // Add to destination
                const destList = newLists.find((l) => l.id === targetListId);
                if (!destList) return prev;

                movedTask.task_list_id = targetListId;

                // Adjust target position if moving within same list and moving down
                let adjustedPosition = targetPosition;
                if (
                    sourceList!.id === targetListId &&
                    sourceTaskIndex < targetPosition
                ) {
                    adjustedPosition = targetPosition;
                }

                destList.tasks.splice(adjustedPosition, 0, movedTask);

                // Update positions
                destList.tasks.forEach((t, i) => {
                    t.position = i;
                });

                return newLists;
            });

            // Skip sync from props
            skipSyncRef.current = true;
            setTimeout(() => {
                skipSyncRef.current = false;
            }, 1000);

            // Save to backend
            fetch(
                updateTask.url({
                    project: project.id,
                    taskList: sourceList.id,
                    task: activeTaskId,
                }),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )?.content || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        task_list_id: targetListId,
                        position: targetPosition,
                    }),
                },
            );

            return;
        }

        // Handle task list (column) drag
        if (!activeId.startsWith('table-task-') && over.id !== active.id) {
            const oldIndex = orderedTaskLists.findIndex(
                (item) => item.id === active.id,
            );
            const newIndex = orderedTaskLists.findIndex(
                (item) => item.id === over.id,
            );

            if (oldIndex === -1 || newIndex === -1) return;

            const movedItem = orderedTaskLists[oldIndex];

            skipSyncRef.current = true;
            setTimeout(() => {
                skipSyncRef.current = false;
            }, 1000);

            const newOrder = arrayMove(orderedTaskLists, oldIndex, newIndex);
            setOrderedTaskLists(newOrder);

            fetch(
                updateTaskList.url({
                    project: project.id,
                    taskList: movedItem.id,
                }),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document.querySelector<HTMLMetaElement>(
                                'meta[name="csrf-token"]',
                            )?.content || '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ position: newIndex }),
                },
            );
        }
    };

    // Sync orderedTaskLists with taskLists when it changes (but skip after drag)
    useEffect(() => {
        if (!skipSyncRef.current) {
            setOrderedTaskLists(taskLists);
        }
        // Auto-expand any new task lists
        setExpandedLists((prev) => {
            const newIds = taskLists
                .map((l) => l.id)
                .filter((id) => !prev.includes(id));
            return newIds.length > 0 ? [...newIds, ...prev] : prev;
        });
    }, [taskLists]);

    // Smart search helper - removes Vietnamese diacritics and normalizes text
    const normalizeText = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    // Fuzzy match - checks if search terms appear in text (in order, but not necessarily consecutive)
    const fuzzyMatch = (text: string, search: string): boolean => {
        const normalizedText = normalizeText(text);
        const normalizedSearch = normalizeText(search);

        // First try exact match
        if (normalizedText.includes(normalizedSearch)) {
            return true;
        }

        // Then try fuzzy match (characters in order)
        let searchIndex = 0;
        for (
            let i = 0;
            i < normalizedText.length && searchIndex < normalizedSearch.length;
            i++
        ) {
            if (normalizedText[i] === normalizedSearch[searchIndex]) {
                searchIndex++;
            }
        }
        return searchIndex === normalizedSearch.length;
    };

    // Smart search - searches multiple fields
    const matchesSearch = (task: Task, query: string): boolean => {
        if (!query) return true;

        const searchTerms = query.trim().split(/\s+/);

        return searchTerms.every((term) => {
            // Search in title
            if (fuzzyMatch(task.title, term)) return true;

            // Search in status (e.g., "progress" matches "in_progress")
            if (fuzzyMatch(task.status.replace('_', ' '), term)) return true;

            // Search in priority
            if (fuzzyMatch(task.priority, term)) return true;

            return false;
        });
    };

    // Filter task lists based on search query (searches both task list names and task titles)
    const filteredTaskLists = orderedTaskLists
        .map((list) => {
            const listNameMatches = searchQuery
                ? fuzzyMatch(list.name, searchQuery)
                : false;

            return {
                ...list,
                // If list name matches, show all tasks; otherwise filter tasks
                tasks: listNameMatches
                    ? list.tasks
                    : list.tasks.filter((task) =>
                          matchesSearch(task, searchQuery),
                      ),
                _listNameMatches: listNameMatches,
            };
        })
        .filter(
            (list) =>
                // Show list if: no search query, list name matches, or has matching tasks
                !searchQuery || list._listNameMatches || list.tasks.length > 0,
        );

    const visibleColumns = columns.filter((col) => col.visible);
    const gridCols = `2fr ${visibleColumns
        .slice(1)
        .map(() => '1fr')
        .join(' ')}`;

    const toggleColumn = (columnId: string) => {
        setColumns((prev) => {
            const newColumns = prev.map((col) =>
                col.id === columnId && !col.required
                    ? { ...col, visible: !col.visible }
                    : col,
            );
            // Save to localStorage
            localStorage.setItem(
                `project-${project.id}-columns`,
                JSON.stringify(newColumns),
            );
            return newColumns;
        });
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
        { title: t('nav.projects', 'Projects'), href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const toggleList = (listId: number) => {
        setExpandedLists((prev) =>
            prev.includes(listId)
                ? prev.filter((id) => id !== listId)
                : [...prev, listId],
        );
    };

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

                        {/* Search and View Toggle */}
                        <div
                            className={`flex items-center gap-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{
                                transition: 'transform 500ms, opacity 500ms',
                                transitionDelay: '300ms',
                            }}
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={t(
                                        'kanban.search',
                                        'Search...',
                                    )}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="h-9 w-52 pr-8 pl-8 text-sm"
                                    title="Smart search: supports Vietnamese, fuzzy match, search by title/status/priority"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <ToggleGroup
                                type="single"
                                value={viewMode}
                                onValueChange={(value) => {
                                    if (value && value !== viewMode) {
                                        setPreviousView(viewMode);
                                        setIsViewTransitioning(true);
                                        setTimeout(() => {
                                            setViewMode(value as ViewMode);
                                            // Update URL with new view mode
                                            const newUrl = new URL(
                                                window.location.href,
                                            );
                                            newUrl.searchParams.set(
                                                'view',
                                                value,
                                            );
                                            window.history.replaceState(
                                                {},
                                                '',
                                                newUrl.toString(),
                                            );
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
                                        {t('kanban.table', 'Table')}
                                    </span>
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="kanban"
                                    aria-label="Kanban view"
                                    className="gap-2 px-3"
                                >
                                    <Kanban className="size-4" />
                                    <span className="hidden sm:inline">
                                        {t('kanban.board', 'Board')}
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
                                        {getColumnLabel(col.id, col.label)}
                                        {col.id === 'task' && (
                                            <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs">
                                                {taskLists.length}
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
                                                {t(
                                                    'common.toggle_columns',
                                                    'Toggle columns',
                                                )}
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
                                                    <span>
                                                        {getColumnLabel(
                                                            column.id,
                                                            column.label,
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Quick Add Task List Row */}
                            <button
                                onClick={() => setIsCreateColumnOpen(true)}
                                className="group flex w-full items-center gap-2 border-b px-4 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/30 hover:text-foreground"
                            >
                                <Plus className="size-4 transition-transform duration-150 group-hover:rotate-90" />
                                <span>
                                    {t(
                                        'task_lists.create_task_list',
                                        'Create task list',
                                    )}
                                </span>
                            </button>

                            {/* Task Lists */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragStart={handleTableDragStart}
                                onDragEnd={handleTableDragEnd}
                            >
                                <SortableContext
                                    items={[
                                        ...filteredTaskLists.map((l) => l.id),
                                        ...filteredTaskLists.flatMap((l) =>
                                            l.tasks.map(
                                                (t) => `table-task-${t.id}`,
                                            ),
                                        ),
                                    ]}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div>
                                        {filteredTaskLists.map(
                                            (list, listIndex) => (
                                                <div key={list.id}>
                                                    {/* List Header - Sortable */}
                                                    <SortableTaskListRow
                                                        list={list}
                                                        isExpanded={expandedLists.includes(
                                                            list.id,
                                                        )}
                                                        onToggle={() =>
                                                            toggleList(list.id)
                                                        }
                                                        onEdit={() => {
                                                            setColumnForm({
                                                                name: list.name,
                                                                description:
                                                                    list.description ||
                                                                    '',
                                                                color: list.color,
                                                            });
                                                            setEditingColumnId(
                                                                list.id,
                                                            );
                                                            setIsEditColumnOpen(
                                                                true,
                                                            );
                                                        }}
                                                        onDelete={() =>
                                                            setDeleteColumnId(
                                                                list.id,
                                                            )
                                                        }
                                                    />

                                                    {/* Tasks - Hidden during task list drag */}
                                                    {expandedLists.includes(
                                                        list.id,
                                                    ) &&
                                                        !isDraggingTaskList && (
                                                            <SortableContext
                                                                items={list.tasks.map(
                                                                    (t) =>
                                                                        `table-task-${t.id}`,
                                                                )}
                                                                strategy={
                                                                    verticalListSortingStrategy
                                                                }
                                                            >
                                                                <div
                                                                    data-list-id={
                                                                        list.id
                                                                    }
                                                                >
                                                                    {list.tasks.map(
                                                                        (
                                                                            task,
                                                                        ) => (
                                                                            <SortableTableTaskRow
                                                                                key={
                                                                                    task.id
                                                                                }
                                                                                task={
                                                                                    task
                                                                                }
                                                                                listId={
                                                                                    list.id
                                                                                }
                                                                                gridCols={
                                                                                    gridCols
                                                                                }
                                                                                columns={
                                                                                    columns
                                                                                }
                                                                                getStatusColor={
                                                                                    getStatusColor
                                                                                }
                                                                                getStatusLabel={
                                                                                    getTranslatedStatusLabel
                                                                                }
                                                                                getPriorityColor={
                                                                                    getPriorityColor
                                                                                }
                                                                                getPriorityLabel={
                                                                                    getTranslatedPriorityLabel
                                                                                }
                                                                                onEdit={() => {
                                                                                    setTaskForm(
                                                                                        {
                                                                                            title: task.title,
                                                                                            description:
                                                                                                task.description ||
                                                                                                '',
                                                                                            priority:
                                                                                                task.priority,
                                                                                            status: task.status,
                                                                                            task_list_id:
                                                                                                task.task_list_id,
                                                                                            due_date:
                                                                                                task.due_date ||
                                                                                                '',
                                                                                        },
                                                                                    );
                                                                                    setEditingTaskId(
                                                                                        task.id,
                                                                                    );
                                                                                    setIsEditTaskOpen(
                                                                                        true,
                                                                                    );
                                                                                }}
                                                                                onDelete={() =>
                                                                                    setDeleteTaskId(
                                                                                        task.id,
                                                                                    )
                                                                                }
                                                                            />
                                                                        ),
                                                                    )}

                                                                    {/* Add Task Button - Hidden during drag */}
                                                                    {!activeTask &&
                                                                        !isDraggingTaskList && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setTaskForm(
                                                                                        (
                                                                                            prev,
                                                                                        ) => ({
                                                                                            ...prev,
                                                                                            task_list_id:
                                                                                                list.id,
                                                                                        }),
                                                                                    );
                                                                                    setIsCreateTaskOpen(
                                                                                        true,
                                                                                    );
                                                                                }}
                                                                                className="group flex w-full items-center gap-2 border-b py-2.5 pr-4 pl-10 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/30 hover:pl-12 hover:text-foreground"
                                                                            >
                                                                                <Plus className="size-4 transition-transform duration-150 group-hover:rotate-90" />
                                                                                <span>
                                                                                    {t(
                                                                                        'tasks.create_task',
                                                                                        'Create task',
                                                                                    )}
                                                                                </span>
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </SortableContext>
                                                        )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </SortableContext>

                                {/* DragOverlay for Table Tasks */}
                                <DragOverlay
                                    dropAnimation={{
                                        duration: 200,
                                        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                                    }}
                                >
                                    {activeTask ? (
                                        <div
                                            className="grid cursor-grabbing rounded-md border bg-background shadow-xl ring-2 ring-primary/30"
                                            style={{
                                                gridTemplateColumns: gridCols,
                                            }}
                                        >
                                            {/* Task Title */}
                                            <div className="flex items-center gap-3 px-4 py-3 pl-6">
                                                <span
                                                    className={`text-sm ${activeTask.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                                                >
                                                    {activeTask.title}
                                                </span>
                                                {activeTask.subtasks_total &&
                                                    activeTask.subtasks_total >
                                                        0 && (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Check className="size-3" />
                                                            {
                                                                activeTask.subtasks_completed
                                                            }
                                                            /
                                                            {
                                                                activeTask.subtasks_total
                                                            }
                                                        </span>
                                                    )}
                                            </div>

                                            {/* Status */}
                                            {columns.find(
                                                (c) => c.id === 'status',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="size-3 rounded"
                                                            style={{
                                                                backgroundColor:
                                                                    getStatusColor(
                                                                        activeTask.status,
                                                                    ),
                                                            }}
                                                        />
                                                        <span className="text-sm">
                                                            {getTranslatedStatusLabel(
                                                                activeTask.status,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Priority */}
                                            {columns.find(
                                                (c) => c.id === 'priority',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3">
                                                    {activeTask.priority ? (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="size-3 rounded"
                                                                style={{
                                                                    backgroundColor:
                                                                        getPriorityColor(
                                                                            activeTask.priority,
                                                                        ),
                                                                }}
                                                            />
                                                            <span className="text-sm">
                                                                {getTranslatedPriorityLabel(
                                                                    activeTask.priority,
                                                                )}
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
                                                (c) => c.id === 'dueDate',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                                                    {activeTask.due_date
                                                        ? new Date(
                                                              activeTask.due_date,
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
                                                (c) => c.id === 'assignee',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3">
                                                    {activeTask.assigned_to ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="size-6">
                                                                <AvatarImage src="" />
                                                                <AvatarFallback className="text-xs">
                                                                    {t(
                                                                        'common.me',
                                                                        'Me',
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">
                                                                {t(
                                                                    'common.me',
                                                                    'Me',
                                                                )}
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
                                                (c) => c.id === 'createdAt',
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
                                                (c) => c.id === 'completedAt',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                                                    {activeTask.completed_at
                                                        ? new Date(
                                                              activeTask.completed_at,
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
                                                (c) => c.id === 'creator',
                                            )?.visible && (
                                                <div className="flex items-center px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="size-6">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback className="text-xs">
                                                                {t(
                                                                    'common.me',
                                                                    'Me',
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">
                                                            {t(
                                                                'common.me',
                                                                'Me',
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    ) : (
                        /* Kanban Board - Clean Design with Drag & Drop */
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            measuring={{
                                droppable: {
                                    strategy: MeasuringStrategy.Always,
                                },
                            }}
                        >
                            <SortableContext
                                items={filteredTaskLists.map((l) => l.id)}
                                strategy={horizontalListSortingStrategy}
                            >
                                <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex h-full gap-5 overflow-x-auto scroll-smooth p-6 pb-4">
                                    {/* Existing Columns from TaskLists */}
                                    {filteredTaskLists.map((list, index) => (
                                        <SortableKanbanColumn
                                            key={list.id}
                                            list={list}
                                            index={index}
                                            mounted={mounted}
                                            onEditColumn={(l) => {
                                                setColumnForm({
                                                    name: l.name,
                                                    description:
                                                        l.description || '',
                                                    color: l.color,
                                                });
                                                setEditingColumnId(l.id);
                                                setIsEditColumnOpen(true);
                                            }}
                                            onDeleteColumn={(id) =>
                                                setDeleteColumnId(id)
                                            }
                                            onAddTask={(listId) => {
                                                setTaskForm((prev) => ({
                                                    ...prev,
                                                    task_list_id: listId,
                                                }));
                                                setIsCreateTaskOpen(true);
                                            }}
                                            onEditTask={(task) => {
                                                setTaskForm({
                                                    title: task.title,
                                                    description:
                                                        task.description || '',
                                                    priority: task.priority,
                                                    status: task.status,
                                                    task_list_id:
                                                        task.task_list_id,
                                                    due_date:
                                                        task.due_date || '',
                                                });
                                                setEditingTaskId(task.id);
                                                setIsEditTaskOpen(true);
                                            }}
                                            onDeleteTask={(taskId) =>
                                                setDeleteTaskId(taskId)
                                            }
                                        />
                                    ))}

                                    {/* Add Column */}
                                    <div
                                        className="flex w-80 shrink-0 flex-col"
                                        style={{
                                            animation: mounted
                                                ? `fadeSlideIn 400ms ease-out ${filteredTaskLists.length * 80}ms both`
                                                : 'none',
                                        }}
                                    >
                                        <div className="mb-3 h-7" />
                                        <button
                                            onClick={() =>
                                                setIsCreateColumnOpen(true)
                                            }
                                            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/25 text-sm text-muted-foreground transition-all hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-foreground"
                                        >
                                            <Plus className="size-4" />
                                            Add column
                                        </button>
                                    </div>
                                </div>
                            </SortableContext>

                            {/* Drag Overlay for Tasks */}
                            <DragOverlay>
                                {activeTask ? (
                                    <SortableTaskCard
                                        task={activeTask}
                                        isDragOverlay
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
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
                                {t('tasks.create_title', 'Create new task')}
                            </SheetTitle>
                            <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                {t('tasks.create_desc', 'Add a new task to')}{' '}
                                {project.name}.
                            </SheetDescription>
                        </SheetHeader>

                        <form className="mt-10 space-y-8">
                            {/* Title */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Label htmlFor="title" className="text-base">
                                    {t('tasks.task_title', 'Task title')}
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
                                    placeholder={t(
                                        'tasks.task_title_placeholder',
                                        'Enter task title',
                                    )}
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
                                    {t('tasks.description', 'Description')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'tasks.description_optional',
                                            '(optional)',
                                        )}
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
                                    placeholder={t(
                                        'tasks.description_placeholder',
                                        'What needs to be done?',
                                    )}
                                    className="min-h-[120px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Task List - Read only, shows which list the task will be added to */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '300ms' }}
                            >
                                <Label className="text-base">
                                    {t('tasks.adding_to', 'Adding to')}
                                </Label>
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
                                <Label className="text-base">
                                    {t('tasks.priority', 'Priority')}
                                </Label>
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
                                            {t('tasks.priority_low', 'Low')}
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
                                            {t(
                                                'tasks.priority_medium',
                                                'Medium',
                                            )}
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
                                            {t('tasks.priority_high', 'High')}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '500ms' }}
                            >
                                <Label className="text-base">
                                    {t('tasks.due_date', 'Due date')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'tasks.due_date_optional',
                                            '(optional)',
                                        )}
                                    </span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`h-12 w-full justify-start text-left text-base font-normal transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/10 ${
                                                !taskForm.due_date &&
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            <Calendar className="mr-3 size-5" />
                                            {taskForm.due_date
                                                ? (() => {
                                                      const [year, month, day] =
                                                          taskForm.due_date
                                                              .split('-')
                                                              .map(Number);
                                                      const date = new Date(
                                                          year,
                                                          month - 1,
                                                          day,
                                                      );
                                                      return date.toLocaleDateString(
                                                          'en-US',
                                                          {
                                                              weekday: 'long',
                                                              year: 'numeric',
                                                              month: 'long',
                                                              day: 'numeric',
                                                          },
                                                      );
                                                  })()
                                                : t(
                                                      'tasks.select_date',
                                                      'Select date',
                                                  )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarPicker
                                            mode="single"
                                            selected={
                                                taskForm.due_date
                                                    ? (() => {
                                                          const [
                                                              year,
                                                              month,
                                                              day,
                                                          ] = taskForm.due_date
                                                              .split('-')
                                                              .map(Number);
                                                          return new Date(
                                                              year,
                                                              month - 1,
                                                              day,
                                                          );
                                                      })()
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setTaskForm((prev) => ({
                                                    ...prev,
                                                    due_date: date
                                                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                                        : '',
                                                }))
                                            }
                                            disabled={{ before: new Date() }}
                                            className="rounded-md border shadow-sm"
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                    {t('tasks.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={!taskForm.title}
                                    onClick={() => {
                                        const formData = { ...taskForm };
                                        setTaskForm({
                                            title: '',
                                            description: '',
                                            priority: 'medium',
                                            status: 'pending',
                                            task_list_id:
                                                mockTaskLists[0]?.id || 1,
                                            due_date: '',
                                        });
                                        setIsCreateTaskOpen(false);

                                        router.post(
                                            storeTask.url({
                                                project: project.id,
                                                taskList: formData.task_list_id,
                                            }),
                                            {
                                                title: formData.title,
                                                description:
                                                    formData.description ||
                                                    null,
                                                priority: formData.priority,
                                                status: formData.status,
                                                due_date:
                                                    formData.due_date || null,
                                            },
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                                only: [], // Don't reload any props to keep optimistic update
                                                onSuccess: () => {
                                                    // Optionally refresh the page or update state
                                                    router.reload();
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {t('tasks.create_btn', 'Create task')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Task Sheet */}
            <Sheet
                open={isEditTaskOpen}
                onOpenChange={(open) => {
                    setIsEditTaskOpen(open);
                    if (!open) {
                        setEditingTaskId(null);
                        setTaskForm({
                            title: '',
                            description: '',
                            priority: 'medium',
                            status: 'pending',
                            task_list_id: mockTaskLists[0]?.id || 1,
                            due_date: '',
                        });
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <div className="mx-auto max-w-lg py-6">
                        <SheetHeader className="text-left">
                            <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                                {t('tasks.edit_title', 'Edit task')}
                            </SheetTitle>
                            <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                {t('tasks.edit_desc', 'Update task details.')}
                            </SheetDescription>
                        </SheetHeader>

                        <form className="mt-10 space-y-8">
                            {/* Title */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Label
                                    htmlFor="edit-title"
                                    className="text-base"
                                >
                                    {t('tasks.task_title', 'Task title')}
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={taskForm.title}
                                    onChange={(e) =>
                                        setTaskForm((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'tasks.task_title_placeholder',
                                        'Enter task title',
                                    )}
                                    className="h-12 text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Description */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '200ms' }}
                            >
                                <Label
                                    htmlFor="edit-description"
                                    className="text-base"
                                >
                                    {t('tasks.description', 'Description')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'tasks.description_optional',
                                            '(optional)',
                                        )}
                                    </span>
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={taskForm.description}
                                    onChange={(e) =>
                                        setTaskForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'tasks.description_placeholder',
                                        'What needs to be done?',
                                    )}
                                    className="min-h-[120px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Status */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '300ms' }}
                            >
                                <Label className="text-base">
                                    {t('tasks.status', 'Status')}
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            value: 'pending',
                                            label: t(
                                                'tasks.status_pending',
                                                'Pending',
                                            ),
                                            color: '#a855f7',
                                        },
                                        {
                                            value: 'in_progress',
                                            label: t(
                                                'tasks.status_in_progress',
                                                'In Progress',
                                            ),
                                            color: '#3b82f6',
                                        },
                                        {
                                            value: 'completed',
                                            label: t(
                                                'tasks.status_completed',
                                                'Completed',
                                            ),
                                            color: '#22c55e',
                                        },
                                        {
                                            value: 'cancelled',
                                            label: t(
                                                'tasks.status_cancelled',
                                                'Cancelled',
                                            ),
                                            color: '#ef4444',
                                        },
                                    ].map((status) => (
                                        <button
                                            key={status.value}
                                            type="button"
                                            onClick={() =>
                                                setTaskForm((prev) => ({
                                                    ...prev,
                                                    status: status.value as
                                                        | 'pending'
                                                        | 'in_progress'
                                                        | 'completed'
                                                        | 'cancelled',
                                                }))
                                            }
                                            className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                                                taskForm.status === status.value
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                                            }`}
                                        >
                                            <div
                                                className="size-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        status.color,
                                                }}
                                            />
                                            <p className="font-medium">
                                                {status.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Priority */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '400ms' }}
                            >
                                <Label className="text-base">
                                    {t('tasks.priority', 'Priority')}
                                </Label>
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
                                            {t('tasks.priority_low', 'Low')}
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
                                            {t(
                                                'tasks.priority_medium',
                                                'Medium',
                                            )}
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
                                            {t('tasks.priority_high', 'High')}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '500ms' }}
                            >
                                <Label className="text-base">
                                    {t('tasks.due_date', 'Due date')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'tasks.due_date_optional',
                                            '(optional)',
                                        )}
                                    </span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`h-12 w-full justify-start text-left text-base font-normal transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/10 ${
                                                !taskForm.due_date &&
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            <Calendar className="mr-3 size-5" />
                                            {taskForm.due_date
                                                ? (() => {
                                                      const [year, month, day] =
                                                          taskForm.due_date
                                                              .split('-')
                                                              .map(Number);
                                                      const date = new Date(
                                                          year,
                                                          month - 1,
                                                          day,
                                                      );
                                                      return date.toLocaleDateString(
                                                          'en-US',
                                                          {
                                                              weekday: 'long',
                                                              year: 'numeric',
                                                              month: 'long',
                                                              day: 'numeric',
                                                          },
                                                      );
                                                  })()
                                                : t(
                                                      'tasks.select_date',
                                                      'Select date',
                                                  )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarPicker
                                            mode="single"
                                            selected={
                                                taskForm.due_date
                                                    ? (() => {
                                                          const [
                                                              year,
                                                              month,
                                                              day,
                                                          ] = taskForm.due_date
                                                              .split('-')
                                                              .map(Number);
                                                          return new Date(
                                                              year,
                                                              month - 1,
                                                              day,
                                                          );
                                                      })()
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setTaskForm((prev) => ({
                                                    ...prev,
                                                    due_date: date
                                                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                                        : '',
                                                }))
                                            }
                                            className="rounded-md border shadow-sm"
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                    onClick={() => setIsEditTaskOpen(false)}
                                >
                                    {t('tasks.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={!taskForm.title || !editingTaskId}
                                    onClick={() => {
                                        if (!editingTaskId) return;

                                        const formData = { ...taskForm };
                                        setIsEditTaskOpen(false);
                                        setEditingTaskId(null);
                                        setTaskForm({
                                            title: '',
                                            description: '',
                                            priority: 'medium',
                                            status: 'pending',
                                            task_list_id:
                                                mockTaskLists[0]?.id || 1,
                                            due_date: '',
                                        });

                                        router.put(
                                            updateTask.url({
                                                project: project.id,
                                                taskList: formData.task_list_id,
                                                task: editingTaskId,
                                            }),
                                            {
                                                title: formData.title,
                                                description:
                                                    formData.description ||
                                                    null,
                                                priority: formData.priority,
                                                status: formData.status,
                                                due_date:
                                                    formData.due_date || null,
                                            },
                                            {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    router.reload();
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {t('tasks.update_btn', 'Update task')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Task Alert Dialog */}
            <AlertDialog
                open={deleteTaskId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTaskId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('tasks.delete_confirm_title', 'Delete task?')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'tasks.delete_confirm_desc',
                                'This action cannot be undone. This will permanently delete this task.',
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setDeleteTaskId(null)}
                        >
                            {t('tasks.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                            onClick={() => {
                                if (!deleteTaskId) return;

                                const taskToDelete = orderedTaskLists
                                    .flatMap((l) => l.tasks)
                                    .find((t) => t.id === deleteTaskId);

                                if (!taskToDelete) return;

                                router.delete(
                                    updateTask.url({
                                        project: project.id,
                                        taskList: taskToDelete.task_list_id,
                                        task: deleteTaskId,
                                    }),
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setDeleteTaskId(null);
                                        },
                                    },
                                );
                            }}
                        >
                            {t('tasks.delete_btn', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Column Sheet */}
            <Sheet
                open={isCreateColumnOpen}
                onOpenChange={setIsCreateColumnOpen}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <div className="mx-auto max-w-lg py-6">
                        <SheetHeader className="text-left">
                            <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                                {t(
                                    'task_lists.create_title',
                                    'Create new column',
                                )}
                            </SheetTitle>
                            <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                {t(
                                    'task_lists.create_desc',
                                    'Add a new column to your Kanban board.',
                                )}
                            </SheetDescription>
                        </SheetHeader>

                        <form className="mt-10 space-y-8">
                            {/* Column Name */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Label
                                    htmlFor="column-name"
                                    className="text-base"
                                >
                                    {t('task_lists.name', 'Column name')}
                                </Label>
                                <Input
                                    id="column-name"
                                    value={columnForm.name}
                                    onChange={(e) =>
                                        setColumnForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'task_lists.name_placeholder',
                                        'e.g., To Do, In Progress, Done',
                                    )}
                                    className="h-12 text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Description */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '150ms' }}
                            >
                                <Label
                                    htmlFor="column-description"
                                    className="text-base"
                                >
                                    {t('task_lists.description', 'Description')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'task_lists.description_optional',
                                            '(optional)',
                                        )}
                                    </span>
                                </Label>
                                <Textarea
                                    id="column-description"
                                    value={columnForm.description}
                                    onChange={(e) =>
                                        setColumnForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'task_lists.description_placeholder',
                                        'Describe what tasks belong in this column',
                                    )}
                                    className="min-h-[100px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Color Picker */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '250ms' }}
                            >
                                <Label className="text-base">
                                    {t('task_lists.color', 'Column color')}
                                </Label>
                                <div className="flex items-center gap-3">
                                    {[
                                        '#3b82f6', // blue
                                        '#ef4444', // red
                                        '#22c55e', // green
                                        '#f59e0b', // amber
                                        '#8b5cf6', // violet
                                        '#ec4899', // pink
                                        '#06b6d4', // cyan
                                        '#64748b', // slate
                                    ].map((color, index) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                setColumnForm((prev) => ({
                                                    ...prev,
                                                    color,
                                                }))
                                            }
                                            className={`size-10 animate-in rounded-full transition-all duration-200 fill-mode-both zoom-in-50 fade-in hover:scale-110 hover:shadow-lg ${
                                                columnForm.color === color
                                                    ? 'scale-110 ring-2 ring-foreground ring-offset-4'
                                                    : ''
                                            }`}
                                            style={{
                                                backgroundColor: color,
                                                animationDelay: `${250 + index * 50}ms`,
                                            }}
                                        />
                                    ))}
                                    {/* Custom color picker */}
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={columnForm.color}
                                            onChange={(e) =>
                                                setColumnForm((prev) => ({
                                                    ...prev,
                                                    color: e.target.value,
                                                }))
                                            }
                                            className="absolute inset-0 size-10 cursor-pointer opacity-0"
                                        />
                                        <div
                                            className={`flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 transition-all duration-200 hover:scale-110 hover:border-foreground ${
                                                ![
                                                    '#3b82f6',
                                                    '#ef4444',
                                                    '#22c55e',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#ec4899',
                                                    '#06b6d4',
                                                    '#64748b',
                                                ].includes(columnForm.color)
                                                    ? 'ring-2 ring-foreground ring-offset-4'
                                                    : ''
                                            }`}
                                            style={{
                                                backgroundColor: ![
                                                    '#3b82f6',
                                                    '#ef4444',
                                                    '#22c55e',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#ec4899',
                                                    '#06b6d4',
                                                    '#64748b',
                                                ].includes(columnForm.color)
                                                    ? columnForm.color
                                                    : 'transparent',
                                            }}
                                        >
                                            {[
                                                '#3b82f6',
                                                '#ef4444',
                                                '#22c55e',
                                                '#f59e0b',
                                                '#8b5cf6',
                                                '#ec4899',
                                                '#06b6d4',
                                                '#64748b',
                                            ].includes(columnForm.color) && (
                                                <Palette className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex animate-in gap-4 pt-6 duration-500 fill-mode-both fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: '400ms' }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-md"
                                    onClick={() => setIsCreateColumnOpen(false)}
                                >
                                    {t('task_lists.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={
                                        !columnForm.name || isCreatingColumn
                                    }
                                    onClick={() => {
                                        setIsCreatingColumn(true);

                                        // Close form immediately
                                        setIsCreateColumnOpen(false);
                                        const formData = { ...columnForm };
                                        setColumnForm({
                                            name: '',
                                            description: '',
                                            color: '#3b82f6',
                                        });

                                        router.post(
                                            storeTaskList.url(project.id),
                                            {
                                                name: formData.name,
                                                description:
                                                    formData.description ||
                                                    null,
                                                color: formData.color,
                                                position: 0,
                                            },
                                            {
                                                preserveScroll: true,
                                                onFinish: () => {
                                                    setIsCreatingColumn(false);
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {isCreatingColumn
                                        ? t('common.loading', 'Creating...')
                                        : t(
                                              'task_lists.create_btn',
                                              'Create column',
                                          )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Edit Column Sheet */}
            <Sheet
                open={isEditColumnOpen}
                onOpenChange={(open) => {
                    setIsEditColumnOpen(open);
                    if (!open) {
                        setEditingColumnId(null);
                        setColumnForm({
                            name: '',
                            description: '',
                            color: '#3b82f6',
                        });
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <div className="mx-auto max-w-lg py-6">
                        <SheetHeader className="text-left">
                            <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                                {t('task_lists.edit_title', 'Edit column')}
                            </SheetTitle>
                            <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                {t(
                                    'task_lists.edit_desc',
                                    'Update column details.',
                                )}
                            </SheetDescription>
                        </SheetHeader>

                        <form className="mt-10 space-y-8">
                            {/* Column Name */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '100ms' }}
                            >
                                <Label
                                    htmlFor="edit-column-name"
                                    className="text-base"
                                >
                                    {t('task_lists.name', 'Column name')}
                                </Label>
                                <Input
                                    id="edit-column-name"
                                    value={columnForm.name}
                                    onChange={(e) =>
                                        setColumnForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'task_lists.name_placeholder',
                                        'e.g., To Do, In Progress, Done',
                                    )}
                                    className="h-12 text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Description */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '150ms' }}
                            >
                                <Label
                                    htmlFor="edit-column-description"
                                    className="text-base"
                                >
                                    {t('task_lists.description', 'Description')}
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        {t(
                                            'task_lists.description_optional',
                                            '(optional)',
                                        )}
                                    </span>
                                </Label>
                                <Textarea
                                    id="edit-column-description"
                                    value={columnForm.description}
                                    onChange={(e) =>
                                        setColumnForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder={t(
                                        'task_lists.description_placeholder',
                                        'Describe what tasks belong in this column',
                                    )}
                                    className="min-h-[100px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Color Picker */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '250ms' }}
                            >
                                <Label className="text-base">
                                    {t('task_lists.color', 'Column color')}
                                </Label>
                                <div className="flex items-center gap-3">
                                    {[
                                        '#3b82f6', // blue
                                        '#ef4444', // red
                                        '#22c55e', // green
                                        '#f59e0b', // amber
                                        '#8b5cf6', // violet
                                        '#ec4899', // pink
                                        '#06b6d4', // cyan
                                        '#64748b', // slate
                                    ].map((color, index) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                setColumnForm((prev) => ({
                                                    ...prev,
                                                    color,
                                                }))
                                            }
                                            className={`size-10 animate-in rounded-full transition-all duration-200 fill-mode-both zoom-in-50 fade-in hover:scale-110 hover:shadow-lg ${
                                                columnForm.color === color
                                                    ? 'scale-110 ring-2 ring-foreground ring-offset-4'
                                                    : ''
                                            }`}
                                            style={{
                                                backgroundColor: color,
                                                animationDelay: `${250 + index * 50}ms`,
                                            }}
                                        />
                                    ))}
                                    {/* Custom color picker */}
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={columnForm.color}
                                            onChange={(e) =>
                                                setColumnForm((prev) => ({
                                                    ...prev,
                                                    color: e.target.value,
                                                }))
                                            }
                                            className="absolute inset-0 size-10 cursor-pointer opacity-0"
                                        />
                                        <div
                                            className={`flex size-10 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 transition-all duration-200 hover:scale-110 hover:border-foreground ${
                                                ![
                                                    '#3b82f6',
                                                    '#ef4444',
                                                    '#22c55e',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#ec4899',
                                                    '#06b6d4',
                                                    '#64748b',
                                                ].includes(columnForm.color)
                                                    ? 'ring-2 ring-foreground ring-offset-4'
                                                    : ''
                                            }`}
                                            style={{
                                                backgroundColor: ![
                                                    '#3b82f6',
                                                    '#ef4444',
                                                    '#22c55e',
                                                    '#f59e0b',
                                                    '#8b5cf6',
                                                    '#ec4899',
                                                    '#06b6d4',
                                                    '#64748b',
                                                ].includes(columnForm.color)
                                                    ? columnForm.color
                                                    : 'transparent',
                                            }}
                                        >
                                            {[
                                                '#3b82f6',
                                                '#ef4444',
                                                '#22c55e',
                                                '#f59e0b',
                                                '#8b5cf6',
                                                '#ec4899',
                                                '#06b6d4',
                                                '#64748b',
                                            ].includes(columnForm.color) && (
                                                <Palette className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex animate-in gap-4 pt-6 duration-500 fill-mode-both fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: '350ms' }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-md"
                                    onClick={() => setIsEditColumnOpen(false)}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={
                                        !columnForm.name.trim() ||
                                        isCreatingColumn
                                    }
                                    onClick={() => {
                                        if (
                                            !columnForm.name.trim() ||
                                            !editingColumnId
                                        )
                                            return;

                                        setIsCreatingColumn(true);
                                        router.put(
                                            updateTaskList.url({
                                                project: project.id,
                                                taskList: editingColumnId,
                                            }),
                                            {
                                                name: columnForm.name.trim(),
                                                description:
                                                    columnForm.description.trim() ||
                                                    null,
                                                color: columnForm.color,
                                            },
                                            {
                                                onSuccess: () => {
                                                    setIsEditColumnOpen(false);
                                                    setEditingColumnId(null);
                                                    setColumnForm({
                                                        name: '',
                                                        description: '',
                                                        color: '#3b82f6',
                                                    });
                                                },
                                                onFinish: () => {
                                                    setIsCreatingColumn(false);
                                                },
                                            },
                                        );
                                    }}
                                >
                                    {isCreatingColumn
                                        ? t('common.saving', 'Saving...')
                                        : t(
                                              'common.save_changes',
                                              'Save changes',
                                          )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Column Confirmation */}
            <AlertDialog
                open={deleteColumnId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteColumnId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('task_lists.delete_title', 'Delete column?')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t(
                                'task_lists.delete_desc',
                                'This will permanently delete this column and all tasks within it. This action cannot be undone.',
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t('common.cancel', 'Cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                if (!deleteColumnId) return;

                                router.delete(
                                    destroyTaskList.url({
                                        project: project.id,
                                        taskList: deleteColumnId,
                                    }),
                                    {
                                        onSuccess: () => {
                                            setDeleteColumnId(null);
                                        },
                                    },
                                );
                            }}
                        >
                            {t('common.delete', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Column Detail Drawer */}
            <Drawer
                open={selectedColumnId !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedColumnId(null);
                }}
            >
                <DrawerContent className="h-[35vh]">
                    {(() => {
                        const selectedColumn = taskLists.find(
                            (l) => l.id === selectedColumnId,
                        );
                        if (!selectedColumn) return null;

                        // Calculate task stats by status
                        const statusCounts = selectedColumn.tasks.reduce(
                            (acc, task) => {
                                acc[task.status] = (acc[task.status] || 0) + 1;
                                return acc;
                            },
                            {} as Record<string, number>,
                        );

                        const totalTasks = selectedColumn.tasks.length;
                        const completedTasks = statusCounts['completed'] || 0;
                        const inProgressTasks =
                            statusCounts['in_progress'] || 0;
                        const pendingTasks = statusCounts['pending'] || 0;
                        const cancelledTasks = statusCounts['cancelled'] || 0;

                        const stats = [
                            {
                                label: t('tasks.status_pending', 'Pending'),
                                count: pendingTasks,
                                color: '#a855f7',
                            },
                            {
                                label: t(
                                    'tasks.status_in_progress',
                                    'In Progress',
                                ),
                                count: inProgressTasks,
                                color: '#3b82f6',
                            },
                            {
                                label: t('tasks.status_completed', 'Completed'),
                                count: completedTasks,
                                color: '#22c55e',
                            },
                            {
                                label: t('tasks.status_cancelled', 'Cancelled'),
                                count: cancelledTasks,
                                color: '#ef4444',
                            },
                        ].filter((s) => s.count > 0);

                        return (
                            <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 pt-2 pb-8">
                                {/* Header */}
                                <div className="mb-8 flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        selectedColumn.color,
                                                }}
                                            />
                                            <DrawerTitle className="text-xl font-semibold">
                                                {selectedColumn.name}
                                            </DrawerTitle>
                                        </div>
                                        {selectedColumn.description && (
                                            <DrawerDescription className="pl-6 text-sm text-muted-foreground">
                                                {selectedColumn.description}
                                            </DrawerDescription>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold tabular-nums">
                                            {totalTasks}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                'tasks.total_tasks',
                                                'total tasks',
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Segmented Progress Bar */}
                                {totalTasks > 0 && (
                                    <div className="mb-6">
                                        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                                            {stats.map((stat, index) => (
                                                <div
                                                    key={stat.label}
                                                    className="transition-all duration-500"
                                                    style={{
                                                        width: `${(stat.count / totalTasks) * 100}%`,
                                                        backgroundColor:
                                                            stat.color,
                                                        marginLeft:
                                                            index > 0
                                                                ? '2px'
                                                                : 0,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-6">
                                    {[
                                        {
                                            label: t(
                                                'tasks.status_pending',
                                                'Pending',
                                            ),
                                            count: pendingTasks,
                                            color: '#a855f7',
                                        },
                                        {
                                            label: t(
                                                'tasks.status_in_progress',
                                                'In Progress',
                                            ),
                                            count: inProgressTasks,
                                            color: '#3b82f6',
                                        },
                                        {
                                            label: t(
                                                'tasks.status_completed',
                                                'Completed',
                                            ),
                                            count: completedTasks,
                                            color: '#22c55e',
                                        },
                                        {
                                            label: t(
                                                'tasks.status_cancelled',
                                                'Cancelled',
                                            ),
                                            count: cancelledTasks,
                                            color: '#ef4444',
                                        },
                                    ].map((stat) => (
                                        <div key={stat.label} className="group">
                                            <div className="flex items-baseline gap-2">
                                                <span
                                                    className="text-2xl font-semibold tabular-nums"
                                                    style={{
                                                        color:
                                                            stat.count > 0
                                                                ? stat.color
                                                                : undefined,
                                                    }}
                                                >
                                                    {stat.count}
                                                </span>
                                                {totalTasks > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {Math.round(
                                                            (stat.count /
                                                                totalTasks) *
                                                                100,
                                                        )}
                                                        %
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {stat.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </DrawerContent>
            </Drawer>
        </AppLayout>
    );
}

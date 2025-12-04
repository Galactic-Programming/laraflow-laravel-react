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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
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
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    closestCenter,
    closestCorners,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    BookOpen,
    Briefcase,
    Calendar,
    ChartBar,
    Check,
    ChevronDown,
    Code,
    Copy,
    Database,
    EyeOff,
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
    Pencil,
    PenTool,
    Plus,
    Rocket,
    Server,
    Settings,
    ShoppingCart,
    Smartphone,
    Table,
    Target,
    Trash2,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

// Sort configuration
type SortDirection = 'asc' | 'desc' | null;
interface SortConfig {
    columnId: string;
    direction: SortDirection;
}

// Draggable Column Header Component
function DraggableColumnHeader({
    column,
    children,
    isFirst,
    sortConfig,
    onSort,
    onHide,
}: {
    column: ColumnConfig;
    children: React.ReactNode;
    isFirst?: boolean;
    sortConfig?: SortConfig;
    onSort?: (columnId: string, direction: SortDirection) => void;
    onHide?: (columnId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, disabled: column.required });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.8 : 1,
    };

    const isSorted = sortConfig?.columnId === column.id;
    const currentDirection = isSorted ? sortConfig.direction : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group/col flex items-center gap-2 py-3 font-medium ${isFirst ? 'px-4' : 'px-3'} ${isDragging ? 'rounded bg-muted/50 shadow-lg' : ''} ${!column.required ? 'cursor-grab active:cursor-grabbing' : ''}`}
            {...(!column.required ? { ...attributes, ...listeners } : {})}
        >
            <div className="flex flex-1 items-center gap-2">
                {children}
                {isSorted && (
                    <span className="text-primary">
                        {currentDirection === 'asc' ? (
                            <ArrowUp className="size-3.5" />
                        ) : (
                            <ArrowDown className="size-3.5" />
                        )}
                    </span>
                )}
            </div>
            {!column.required && onSort && onHide && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover/col:opacity-100 hover:bg-muted"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <ChevronDown className="size-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {column.id === 'dueDate' ? (
                            <>
                                <DropdownMenuItem
                                    onClick={() => onSort(column.id, 'desc')}
                                    className={
                                        currentDirection === 'desc'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <ArrowDown className="mr-2 size-4" />
                                    Latest to earliest
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onSort(column.id, 'asc')}
                                    className={
                                        currentDirection === 'asc'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <ArrowUp className="mr-2 size-4" />
                                    Earliest to latest
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem
                                    onClick={() => onSort(column.id, 'asc')}
                                    className={
                                        currentDirection === 'asc'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <ArrowUp className="mr-2 size-4" />
                                    Sort ascending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onSort(column.id, 'desc')}
                                    className={
                                        currentDirection === 'desc'
                                            ? 'bg-accent'
                                            : ''
                                    }
                                >
                                    <ArrowDown className="mr-2 size-4" />
                                    Sort descending
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem onClick={() => onHide(column.id)}>
                            <EyeOff className="mr-2 size-4" />
                            Hide column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

// Draggable Kanban Column Component
function DraggableKanbanColumn({
    column,
    headerContent,
    hasAnimated,
    index,
    onAddTask,
    tasks,
}: {
    column: KanbanColumn;
    headerContent: React.ReactNode;
    hasAnimated: boolean;
    index: number;
    onAddTask: () => void;
    tasks: Task[];
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        transition: {
            duration: 250,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition:
            transition || 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.95 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                animation: !hasAnimated
                    ? `fadeSlideIn 400ms ease-out ${index * 80}ms both`
                    : 'none',
            }}
            className={`group/column flex w-80 shrink-0 flex-col transition-shadow duration-200 ${isDragging ? 'scale-[1.02] rounded-xl bg-background shadow-2xl ring-2 ring-primary/30' : ''}`}
        >
            {/* Column Header - Draggable */}
            <div
                className="mb-3 flex cursor-grab items-center justify-between rounded-lg px-1 py-1 transition-colors hover:bg-muted/50 active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                {headerContent}
            </div>

            {/* Cards Container */}
            <div className="relative flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl bg-muted/40 p-2.5">
                {/* Task Cards */}
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="rounded-lg border bg-background p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <h4 className="mb-2 text-sm font-medium">
                            {task.title}
                        </h4>
                        {task.description && (
                            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                                {task.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                        task.priority === 'high'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            : task.priority === 'medium'
                                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    }`}
                                >
                                    {task.priority}
                                </span>
                            </div>
                            {task.due_date && (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(
                                        task.due_date,
                                    ).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add task button - shows on hover in center */}
                <button
                    onClick={onAddTask}
                    className="absolute inset-0 m-2.5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-transparent text-sm text-muted-foreground opacity-0 transition-all group-hover/column:opacity-100 hover:border-muted-foreground/30 hover:bg-background/50"
                >
                    <Plus className="size-4" />
                    <span>Add task</span>
                </button>
            </div>
        </div>
    );
}

// Droppable Task List Container for Table View
function DroppableTaskList({
    listId,
    listName,
    children,
}: {
    listId: number;
    listName: string;
    children: React.ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `list-${listId}`,
        data: { listId },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[40px] transition-all duration-200 ${isOver ? 'bg-primary/10 ring-2 ring-primary/30 ring-inset' : ''}`}
        >
            {children}
            {/* Drop zone indicator when empty or hovering */}
            {isOver && (
                <div className="flex items-center justify-center border-b border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm text-primary">
                    Drop here to move to "{listName}"
                </div>
            )}
        </div>
    );
}

// Sortable Task Row Component for Table View
function SortableTaskRow({
    task,
    taskIndex,
    listId,
    projectId,
    gridCols,
    columns,
    getStatusColor,
    getStatusLabel,
    getPriorityColor,
    handleCompleteTask,
    handleDuplicateTask,
    handleDeleteTask,
    handleUpdateStatus,
    handleOpenTaskDetail,
}: {
    task: Task;
    taskIndex: number;
    listId: number;
    projectId: number;
    gridCols: string;
    columns: ColumnConfig[];
    getStatusColor: (status: string) => string;
    getStatusLabel: (status: string) => string;
    getPriorityColor: (priority: string) => string;
    handleCompleteTask: (taskId: number) => void;
    handleDuplicateTask: (taskId: number) => void;
    handleDeleteTask: (task: Task) => void;
    handleUpdateStatus: (taskId: number, status: Task['status']) => void;
    handleOpenTaskDetail: (task: Task) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { task, listId },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition:
            transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 50 : undefined,
        gridTemplateColumns: `${gridCols} 40px`,
        gridColumn: '1 / -1',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group grid cursor-grab border-b transition-all duration-150 hover:bg-muted/30 active:cursor-grabbing ${isDragging ? 'bg-muted/50 shadow-lg' : ''}`}
            {...attributes}
            {...listeners}
        >
            {/* Task Title */}
            <div
                className="flex items-center gap-1 px-3 py-3"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => handleOpenTaskDetail(task)}
                    className={`cursor-pointer text-left text-sm hover:text-primary hover:underline ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                >
                    {task.title}
                </button>
                {task.subtasks_total && task.subtasks_total > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Check className="size-3" />
                        {task.subtasks_completed}/{task.subtasks_total}
                    </span>
                )}
            </div>

            {/* Status */}
            {columns.find((c) => c.id === 'status')?.visible && (
                <div
                    className="flex items-center px-3 py-3"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent">
                                <div
                                    className="size-3 rounded"
                                    style={{
                                        backgroundColor: getStatusColor(
                                            task.status,
                                        ),
                                    }}
                                />
                                <span className="text-sm">
                                    {getStatusLabel(task.status)}
                                </span>
                                <ChevronDown className="size-3 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                            {(
                                [
                                    'pending',
                                    'in_progress',
                                    'completed',
                                    'cancelled',
                                ] as const
                            ).map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() =>
                                        handleUpdateStatus(task.id, status)
                                    }
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="size-3 rounded"
                                        style={{
                                            backgroundColor:
                                                getStatusColor(status),
                                        }}
                                    />
                                    <span>{getStatusLabel(status)}</span>
                                    {task.status === status && (
                                        <Check className="ml-auto size-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                            <span className="text-sm capitalize">
                                {task.priority}
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
                                    Me
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Me</span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">–</span>
                    )}
                </div>
            )}

            {/* Created At */}
            {columns.find((c) => c.id === 'createdAt')?.visible && (
                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                    {task.created_at
                        ? new Date(task.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                          })
                        : '–'}
                </div>
            )}

            {/* Completed At */}
            {columns.find((c) => c.id === 'completedAt')?.visible && (
                <div className="flex items-center px-3 py-3 text-sm text-muted-foreground">
                    {task.completed_at
                        ? new Date(task.completed_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                          })
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
                                Me
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Me</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center px-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                            size="icon"
                        >
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-2">
                        <div className="space-y-1">
                            <button
                                onClick={() => handleDuplicateTask(task.id)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-accent"
                            >
                                <Copy className="size-4" />
                                Duplicate task
                            </button>
                            <button
                                onClick={() => handleDeleteTask(task)}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                            >
                                <Trash2 className="size-4" />
                                Delete task
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

// Kanban column interface (matches database schema)
interface KanbanColumn {
    id: number;
    name: string;
    description?: string;
    color: string;
    position: number;
}

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
    created_at?: string;
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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed':
            return '#22c55e';
        case 'In Progress':
            return '#3b82f6';
        case 'Cancelled':
            return '#ef4444';
        default:
            return '#a855f7'; // pending - purple like "New task"
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'completed':
        case 'Completed':
            return 'Completed';
        case 'in_progress':
        case 'In Progress':
            return 'In Progress';
        case 'cancelled':
        case 'Cancelled':
            return 'Cancelled';
        case 'pending':
        case 'Pending':
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

export default function ProjectShow({ project }: Props) {
    // Get initial view mode from URL
    const getInitialViewMode = (): ViewMode => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const view = params.get('view');
            if (view === 'kanban' || view === 'table') {
                return view;
            }
        }
        return 'table';
    };

    // Get initial columns from URL
    const getInitialColumns = (): ColumnConfig[] => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const cols = params.get('cols');
            if (cols) {
                const visibleIds = cols.split(',');
                return defaultColumns.map((col) => ({
                    ...col,
                    visible: col.required || visibleIds.includes(col.id),
                }));
            }
        }
        return defaultColumns;
    };

    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
    const [previousView, setPreviousView] =
        useState<ViewMode>(getInitialViewMode);
    const [isViewTransitioning, setIsViewTransitioning] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [kanbanAnimated, setKanbanAnimated] = useState(false);
    const [expandedLists, setExpandedLists] = useState<number[]>(
        project.task_lists?.map((l) => l.id) || [],
    );
    const [columns, setColumns] = useState<ColumnConfig[]>(getInitialColumns);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        columnId: '',
        direction: null,
    });
    // Initialize kanban columns from database (project.task_lists)
    const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>(
        () =>
            project.task_lists
                ?.map((tl) => ({
                    id: tl.id,
                    name: tl.name,
                    description: tl.description,
                    color: tl.color,
                    position: tl.position,
                }))
                .sort((a, b) => a.position - b.position) || [],
    );
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnDescription, setNewColumnDescription] = useState('');
    const [newColumnColor, setNewColumnColor] = useState('#64748b');
    const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(
        null,
    );
    const [selectedColumnForTask, setSelectedColumnForTask] = useState<
        number | null
    >(null);
    const [selectedColumnForDetails, setSelectedColumnForDetails] =
        useState<KanbanColumn | null>(null);
    const [deleteTask, setDeleteTask] = useState<Task | null>(null);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    // Task detail/edit state
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as Task['status'],
        due_date: '',
    });
    // Local state for task lists to enable optimistic updates
    const [localTaskLists, setLocalTaskLists] = useState<TaskList[]>(
        () => project.task_lists || [],
    );
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'pending' as
            | 'pending'
            | 'in_progress'
            | 'completed'
            | 'cancelled',
        task_list_id: project.task_lists?.[0]?.id || 1,
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

    const handleSort = (columnId: string, direction: SortDirection) => {
        // Toggle off if clicking same sort
        if (
            sortConfig.columnId === columnId &&
            sortConfig.direction === direction
        ) {
            setSortConfig({ columnId: '', direction: null });
        } else {
            setSortConfig({ columnId, direction });
        }
    };

    const handleHideColumn = (columnId: string) => {
        toggleColumn(columnId);
    };

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleColumnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setColumns((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleKanbanColumnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setKanbanColumns((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update positions in database
                const reorderedItems = newItems.map((item, index) => ({
                    id: item.id,
                    position: index,
                }));
                router.post(
                    `/projects/${project.id}/task-lists/reorder`,
                    { task_lists: reorderedItems },
                    { preserveScroll: true },
                );

                return newItems;
            });
        }
    };

    const handleTaskDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current as
            | { task: Task; listId: number }
            | undefined;
        if (!activeData) return;

        const activeTaskId = active.id as number;
        const sourceListId = activeData.listId;

        // Check if dropping on a list container
        const overId = over.id.toString();
        let targetListId: number;
        let targetTaskId: number | null = null;

        if (overId.startsWith('list-')) {
            // Dropping directly on a list container
            targetListId = parseInt(overId.replace('list-', ''));
        } else {
            // Dropping on another task
            const overData = over.data.current as
                | { task: Task; listId: number }
                | undefined;
            if (!overData) return;
            targetListId = overData.listId;
            targetTaskId = over.id as number;
        }

        // Same list reordering
        if (sourceListId === targetListId) {
            if (targetTaskId === null || activeTaskId === targetTaskId) return;

            setLocalTaskLists((prevLists) => {
                const newLists = prevLists.map((list) => {
                    if (list.id !== sourceListId) return list;

                    const oldIndex = list.tasks.findIndex(
                        (t) => t.id === activeTaskId,
                    );
                    const newIndex = list.tasks.findIndex(
                        (t) => t.id === targetTaskId,
                    );

                    if (oldIndex === -1 || newIndex === -1) return list;

                    const reorderedTasks = arrayMove(
                        list.tasks,
                        oldIndex,
                        newIndex,
                    );

                    // Send to server in background
                    const tasksToSend = reorderedTasks.map((task, index) => ({
                        id: task.id,
                        position: index,
                    }));
                    router.post(
                        `/projects/${project.id}/tasks/reorder`,
                        { tasks: tasksToSend },
                        { preserveScroll: true, preserveState: true },
                    );

                    return { ...list, tasks: reorderedTasks };
                });
                return newLists;
            });
        } else {
            // Moving to different list - optimistic update
            setLocalTaskLists((prevLists) => {
                const sourceList = prevLists.find((l) => l.id === sourceListId);
                const targetList = prevLists.find((l) => l.id === targetListId);
                if (!sourceList || !targetList) return prevLists;

                const taskIndex = sourceList.tasks.findIndex(
                    (t) => t.id === activeTaskId,
                );
                if (taskIndex === -1) return prevLists;

                const task = sourceList.tasks[taskIndex];

                // Calculate new position
                let newPosition = 0;
                if (targetTaskId !== null) {
                    const targetIndex = targetList.tasks.findIndex(
                        (t) => t.id === targetTaskId,
                    );
                    newPosition =
                        targetIndex !== -1
                            ? targetIndex
                            : targetList.tasks.length;
                } else {
                    newPosition = targetList.tasks.length;
                }

                // Determine new status based on target list name
                const statusMap: Record<string, Task['status']> = {
                    pending: 'pending',
                    in_progress: 'in_progress',
                    completed: 'completed',
                    cancelled: 'cancelled',
                };
                const newStatus = statusMap[targetList.name] || task.status;

                // Create new lists with the task moved
                const newLists = prevLists.map((list) => {
                    if (list.id === sourceListId) {
                        return {
                            ...list,
                            tasks: list.tasks.filter(
                                (t) => t.id !== activeTaskId,
                            ),
                        };
                    }
                    if (list.id === targetListId) {
                        const newTasks = [...list.tasks];
                        newTasks.splice(newPosition, 0, {
                            ...task,
                            task_list_id: targetListId,
                            status: newStatus,
                            completed_at:
                                newStatus === 'completed'
                                    ? new Date().toISOString()
                                    : undefined,
                        });
                        return { ...list, tasks: newTasks };
                    }
                    return list;
                });

                // Send to server in background (no reload needed)
                router.patch(
                    `/projects/${project.id}/tasks/${activeTaskId}/move`,
                    {
                        task_list_id: targetListId,
                        position: newPosition,
                    },
                    { preserveScroll: true, preserveState: true },
                );

                return newLists;
            });
        }
    };

    const handleAddColumn = () => {
        if (!newColumnName.trim()) return;

        router.post(
            `/projects/${project.id}/task-lists`,
            {
                name: newColumnName.trim(),
                description: newColumnDescription.trim() || null,
                color: newColumnColor,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewColumnName('');
                    setNewColumnDescription('');
                    setNewColumnColor('#64748b');
                    setIsAddColumnOpen(false);
                },
            },
        );
    };

    const handleDeleteColumn = (columnId: number) => {
        router.delete(`/projects/${project.id}/task-lists/${columnId}`, {
            preserveScroll: true,
        });
    };

    const handleEditColumn = (column: KanbanColumn) => {
        setEditingColumn(column);
        setNewColumnName(column.name);
        setNewColumnDescription(column.description || '');
        setNewColumnColor(column.color);
    };

    const handleSaveEditColumn = () => {
        if (!editingColumn || !newColumnName.trim()) return;

        router.put(
            `/projects/${project.id}/task-lists/${editingColumn.id}`,
            {
                name: newColumnName.trim(),
                description: newColumnDescription.trim() || null,
                color: newColumnColor,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingColumn(null);
                    setNewColumnName('');
                    setNewColumnDescription('');
                    setNewColumnColor('#64748b');
                },
            },
        );
    };

    const handleCreateTask = () => {
        router.post(
            `/projects/${project.id}/tasks`,
            {
                task_list_id: taskForm.task_list_id,
                title: taskForm.title,
                description: taskForm.description || null,
                priority: taskForm.priority,
                status: taskForm.status,
                due_date: taskForm.due_date || null,
                assigned_to: null, // Will be implemented later
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateTaskOpen(false);
                    setTaskForm({
                        title: '',
                        description: '',
                        priority: 'medium',
                        status: 'pending',
                        task_list_id: project.task_lists?.[0]?.id || 1,
                        due_date: '',
                    });
                    setSelectedColumnForTask(null);
                    // Reload to sync table and kanban views
                    router.reload();
                },
            },
        );
    };

    const handleCompleteTask = (taskId: number) => {
        router.patch(
            `/projects/${project.id}/tasks/${taskId}/complete`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const handleDuplicateTask = (taskId: number) => {
        router.post(
            `/projects/${project.id}/tasks/${taskId}/duplicate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const handleDeleteTask = (task: Task) => {
        setDeleteTask(task);
    };

    const handleUpdateStatus = (taskId: number, status: Task['status']) => {
        // Optimistic update
        setLocalTaskLists((prevLists) => {
            const statusToListMap: Record<string, string> = {
                pending: 'pending',
                in_progress: 'in_progress',
                completed: 'completed',
                cancelled: 'cancelled',
            };

            const targetListName = statusToListMap[status];
            const targetList = prevLists.find((l) => l.name === targetListName);
            const sourceList = prevLists.find((l) =>
                l.tasks.some((t) => t.id === taskId),
            );

            if (!sourceList) return prevLists;

            const task = sourceList.tasks.find((t) => t.id === taskId);
            if (!task) return prevLists;

            // If target list exists and is different, move the task
            if (targetList && targetList.id !== sourceList.id) {
                return prevLists.map((list) => {
                    if (list.id === sourceList.id) {
                        return {
                            ...list,
                            tasks: list.tasks.filter((t) => t.id !== taskId),
                        };
                    }
                    if (list.id === targetList.id) {
                        return {
                            ...list,
                            tasks: [
                                ...list.tasks,
                                {
                                    ...task,
                                    status,
                                    task_list_id: targetList.id,
                                    completed_at:
                                        status === 'completed'
                                            ? new Date().toISOString()
                                            : undefined,
                                },
                            ],
                        };
                    }
                    return list;
                });
            }

            // Just update status in place (when no matching list found)
            return prevLists.map((list) => ({
                ...list,
                tasks: list.tasks.map((t) =>
                    t.id === taskId
                        ? {
                              ...t,
                              status,
                              completed_at:
                                  status === 'completed'
                                      ? new Date().toISOString()
                                      : undefined,
                          }
                        : t,
                ),
            }));
        });

        // Send to server using fetch (avoid Inertia's page reload behavior)
        fetch(`/projects/${project.id}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ status }),
        }).catch(() => {
            // Revert on error by reloading
            router.reload();
        });
    };

    const confirmDeleteTask = () => {
        if (!deleteTask) return;

        setIsDeletingTask(true);
        router.delete(`/projects/${project.id}/tasks/${deleteTask.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload();
            },
            onFinish: () => {
                setIsDeletingTask(false);
                setDeleteTask(null);
            },
        });
    };

    const handleOpenTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setEditTaskForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date || '',
        });
        setIsEditingTask(false);
    };

    const handleUpdateTask = () => {
        if (!selectedTask) return;

        // Optimistic update
        setLocalTaskLists((prevLists) =>
            prevLists.map((list) => ({
                ...list,
                tasks: list.tasks.map((t) =>
                    t.id === selectedTask.id
                        ? {
                              ...t,
                              title: editTaskForm.title,
                              description:
                                  editTaskForm.description || undefined,
                              priority: editTaskForm.priority,
                              status: editTaskForm.status,
                              due_date: editTaskForm.due_date || undefined,
                              completed_at:
                                  editTaskForm.status === 'completed'
                                      ? new Date().toISOString()
                                      : undefined,
                          }
                        : t,
                ),
            })),
        );

        // Update selected task locally
        setSelectedTask((prev) =>
            prev
                ? {
                      ...prev,
                      title: editTaskForm.title,
                      description: editTaskForm.description || undefined,
                      priority: editTaskForm.priority,
                      status: editTaskForm.status,
                      due_date: editTaskForm.due_date || undefined,
                  }
                : null,
        );

        setIsEditingTask(false);

        // Send to server
        fetch(`/projects/${project.id}/tasks/${selectedTask.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                title: editTaskForm.title,
                description: editTaskForm.description || null,
                priority: editTaskForm.priority,
                status: editTaskForm.status,
                due_date: editTaskForm.due_date || null,
            }),
        }).catch(() => {
            router.reload();
        });
    };

    const handleAddTaskToColumn = (columnId: number) => {
        setSelectedColumnForTask(columnId);

        // Find the column name to set the appropriate status
        const column = kanbanColumns.find((c) => c.id === columnId);
        const statusMap: Record<string, Task['status']> = {
            pending: 'pending',
            in_progress: 'in_progress',
            completed: 'completed',
            cancelled: 'cancelled',
        };
        const newStatus = column
            ? statusMap[column.name] || 'pending'
            : 'pending';

        setTaskForm((prev) => ({
            ...prev,
            task_list_id: columnId,
            status: newStatus,
        }));
        setIsCreateTaskOpen(true);
    };

    const columnColors = [
        '#64748b', // slate
        '#3b82f6', // blue
        '#22c55e', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
    ];

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    // Sync local task lists when project.task_lists changes from server
    useEffect(() => {
        setLocalTaskLists(project.task_lists || []);
    }, [project.task_lists]);

    // Sync kanban columns when project.task_lists changes from server
    useEffect(() => {
        const newColumns =
            project.task_lists
                ?.map((tl) => ({
                    id: tl.id,
                    name: tl.name,
                    description: tl.description,
                    color: tl.color,
                    position: tl.position,
                }))
                .sort((a, b) => a.position - b.position) || [];
        setKanbanColumns(newColumns);
    }, [project.task_lists]);

    // Sync view mode with URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const currentView = params.get('view');

        if (currentView !== viewMode) {
            params.set('view', viewMode);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }
    }, [viewMode]);

    // Sync visible columns with URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const visibleIds = columns
            .filter((col) => col.visible && !col.required)
            .map((col) => col.id);

        // Check if columns match default visibility
        const defaultVisibleIds = defaultColumns
            .filter((col) => col.visible && !col.required)
            .map((col) => col.id);

        const isDefault =
            visibleIds.length === defaultVisibleIds.length &&
            visibleIds.every((id) => defaultVisibleIds.includes(id));

        if (isDefault) {
            // Remove cols param if it matches default
            params.delete('cols');
        } else {
            // Save visible column ids to URL
            params.set('cols', visibleIds.join(','));
        }

        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }, [columns]);

    // Mark kanban animation as complete after initial animation
    useEffect(() => {
        if (viewMode === 'kanban' && mounted && !kanbanAnimated) {
            const timer = setTimeout(() => setKanbanAnimated(true), 800);
            return () => clearTimeout(timer);
        }
    }, [viewMode, mounted, kanbanAnimated]);

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

    const taskLists = localTaskLists;

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
                                className="relative rounded-lg bg-muted p-1"
                            >
                                {/* Animated background indicator */}
                                <div
                                    className="absolute inset-y-1 rounded-md bg-background shadow-sm transition-all duration-300 ease-out"
                                    style={{
                                        width: 'calc(50% - 2px)',
                                        left:
                                            viewMode === 'table'
                                                ? '4px'
                                                : 'calc(50% + 2px)',
                                        transform: `scale(${isViewTransitioning ? 0.95 : 1})`,
                                    }}
                                />
                                <ToggleGroupItem
                                    value="table"
                                    aria-label="Table view"
                                    className={`relative z-10 gap-2 px-4 py-2 transition-all duration-300 data-[state=on]:bg-transparent data-[state=on]:shadow-none ${
                                        viewMode === 'table'
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Table
                                        className={`size-4 transition-transform duration-300 ${
                                            viewMode === 'table'
                                                ? 'scale-110'
                                                : 'scale-100'
                                        }`}
                                    />
                                    <span
                                        className={`hidden transition-all duration-300 sm:inline ${
                                            viewMode === 'table'
                                                ? 'font-medium'
                                                : 'font-normal'
                                        }`}
                                    >
                                        Table
                                    </span>
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="kanban"
                                    aria-label="Kanban view"
                                    className={`relative z-10 gap-2 px-4 py-2 transition-all duration-300 data-[state=on]:bg-transparent data-[state=on]:shadow-none ${
                                        viewMode === 'kanban'
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Kanban
                                        className={`size-4 transition-transform duration-300 ${
                                            viewMode === 'kanban'
                                                ? 'scale-110'
                                                : 'scale-100'
                                        }`}
                                    />
                                    <span
                                        className={`hidden transition-all duration-300 sm:inline ${
                                            viewMode === 'kanban'
                                                ? 'font-medium'
                                                : 'font-normal'
                                        }`}
                                    >
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
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleColumnDragEnd}
                            >
                                <div
                                    className="sticky top-0 z-10 grid border-b bg-background text-sm text-muted-foreground"
                                    style={{
                                        gridTemplateColumns: `${gridCols} 40px`,
                                    }}
                                >
                                    <SortableContext
                                        items={visibleColumns.map(
                                            (col) => col.id,
                                        )}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {visibleColumns.map((col, index) => (
                                            <DraggableColumnHeader
                                                key={col.id}
                                                column={col}
                                                isFirst={col.id === 'task'}
                                                sortConfig={sortConfig}
                                                onSort={handleSort}
                                                onHide={handleHideColumn}
                                            >
                                                {col.id === 'task' && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                expandedLists.length >
                                                                0
                                                            ) {
                                                                setExpandedLists(
                                                                    [],
                                                                );
                                                            } else {
                                                                setExpandedLists(
                                                                    taskLists.map(
                                                                        (l) =>
                                                                            l.id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                        className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                                    >
                                                        <ChevronDown
                                                            className={`size-4 transition-transform duration-200 ${
                                                                expandedLists.length >
                                                                0
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
                                                                acc +
                                                                list.tasks
                                                                    .length,
                                                            0,
                                                        )}
                                                    </span>
                                                )}
                                            </DraggableColumnHeader>
                                        ))}
                                    </SortableContext>
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
                                                            toggleColumn(
                                                                column.id,
                                                            )
                                                        }
                                                        disabled={
                                                            column.required
                                                        }
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
                                                            {column.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </DndContext>

                            {/* Quick Add Task Row */}
                            <button
                                onClick={() => setIsCreateTaskOpen(true)}
                                className="group flex w-full items-center gap-2 border-b px-4 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:bg-muted/30 hover:text-foreground"
                            >
                                <Plus className="size-4 transition-transform duration-150 group-hover:rotate-90" />
                                <span>Create task</span>
                            </button>

                            {/* All Tasks - Flat List */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragEnd={handleTaskDragEnd}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `${gridCols} 40px`,
                                    }}
                                >
                                    <SortableContext
                                        items={taskLists.flatMap((list) =>
                                            list.tasks.map((t) => t.id),
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {taskLists.flatMap((list) =>
                                            list.tasks.map(
                                                (task, taskIndex) => (
                                                    <SortableTaskRow
                                                        key={task.id}
                                                        task={task}
                                                        taskIndex={taskIndex}
                                                        listId={list.id}
                                                        projectId={project.id}
                                                        gridCols={gridCols}
                                                        columns={columns}
                                                        getStatusColor={
                                                            getStatusColor
                                                        }
                                                        getStatusLabel={
                                                            getStatusLabel
                                                        }
                                                        getPriorityColor={
                                                            getPriorityColor
                                                        }
                                                        handleCompleteTask={
                                                            handleCompleteTask
                                                        }
                                                        handleDuplicateTask={
                                                            handleDuplicateTask
                                                        }
                                                        handleDeleteTask={
                                                            handleDeleteTask
                                                        }
                                                        handleUpdateStatus={
                                                            handleUpdateStatus
                                                        }
                                                        handleOpenTaskDetail={
                                                            handleOpenTaskDetail
                                                        }
                                                    />
                                                ),
                                            ),
                                        )}
                                    </SortableContext>
                                </div>
                            </DndContext>
                        </div>
                    ) : (
                        /* Kanban Board - Clean Design */
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToHorizontalAxis]}
                            onDragEnd={handleKanbanColumnDragEnd}
                        >
                            <div className="flex h-full gap-5 overflow-x-auto p-6">
                                <SortableContext
                                    items={kanbanColumns.map((col) => col.id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    {kanbanColumns.map((column, index) => {
                                        const columnTasks =
                                            taskLists.find(
                                                (tl) => tl.id === column.id,
                                            )?.tasks || [];
                                        return (
                                            <DraggableKanbanColumn
                                                key={column.id}
                                                column={column}
                                                hasAnimated={kanbanAnimated}
                                                index={index}
                                                onAddTask={() =>
                                                    handleAddTaskToColumn(
                                                        column.id,
                                                    )
                                                }
                                                tasks={columnTasks}
                                                headerContent={
                                                    <>
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className="size-2.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        column.color,
                                                                }}
                                                            />
                                                            <button
                                                                className="text-sm font-semibold text-foreground hover:underline"
                                                                onPointerDown={(
                                                                    e,
                                                                ) =>
                                                                    e.stopPropagation()
                                                                }
                                                                onClick={() =>
                                                                    setSelectedColumnForDetails(
                                                                        column,
                                                                    )
                                                                }
                                                            >
                                                                {column.name}
                                                            </button>
                                                            <span className="text-sm text-muted-foreground">
                                                                {project.task_lists?.find(
                                                                    (tl) =>
                                                                        tl.id ===
                                                                        column.id,
                                                                )?.tasks
                                                                    .length ||
                                                                    0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/column:opacity-100">
                                                            <button
                                                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                onPointerDown={(
                                                                    e,
                                                                ) =>
                                                                    e.stopPropagation()
                                                                }
                                                                onClick={() =>
                                                                    handleAddTaskToColumn(
                                                                        column.id,
                                                                    )
                                                                }
                                                                title="Add task"
                                                            >
                                                                <Plus className="size-4" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                        onPointerDown={(
                                                                            e,
                                                                        ) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                    >
                                                                        <MoreHorizontal className="size-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleEditColumn(
                                                                                column,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="mr-2 size-4" />
                                                                        Edit
                                                                        column
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="font-medium text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                                                                        onClick={() =>
                                                                            handleDeleteColumn(
                                                                                column.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="mr-2 size-4" />
                                                                        Delete
                                                                        column
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </>
                                                }
                                            />
                                        );
                                    })}
                                </SortableContext>

                                {/* Add Column Button */}
                                <div
                                    className="flex w-80 shrink-0 flex-col"
                                    style={{
                                        animation: !kanbanAnimated
                                            ? `fadeSlideIn 400ms ease-out ${kanbanColumns.length * 80}ms both`
                                            : 'none',
                                    }}
                                >
                                    <div className="mb-3 h-7" />
                                    <button
                                        onClick={() => setIsAddColumnOpen(true)}
                                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/25 text-sm text-muted-foreground transition-all hover:border-muted-foreground/50 hover:bg-muted/30 hover:text-foreground"
                                    >
                                        <Plus className="size-4" />
                                        Add column
                                    </button>
                                </div>
                            </div>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Add Column Dialog */}
            <Dialog
                open={isAddColumnOpen}
                onOpenChange={(open) => {
                    setIsAddColumnOpen(open);
                    if (!open) {
                        setNewColumnName('');
                        setNewColumnDescription('');
                        setNewColumnColor('#64748b');
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New column</DialogTitle>
                        <DialogDescription>
                            Add a new column to your board.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="column-name">Name</Label>
                            <Input
                                id="column-name"
                                placeholder="e.g. Backlog, Testing..."
                                value={newColumnName}
                                onChange={(e) =>
                                    setNewColumnName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddColumn();
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="column-description">
                                Description
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Textarea
                                id="column-description"
                                placeholder="What is this column for?"
                                value={newColumnDescription}
                                onChange={(e) =>
                                    setNewColumnDescription(e.target.value)
                                }
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {columnColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewColumnColor(color)}
                                        className={`size-8 rounded-full transition-all hover:scale-110 ${
                                            newColumnColor === color
                                                ? 'ring-2 ring-primary ring-offset-2'
                                                : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setIsAddColumnOpen(false);
                                    setNewColumnName('');
                                    setNewColumnDescription('');
                                    setNewColumnColor('#64748b');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleAddColumn}
                                disabled={!newColumnName.trim()}
                            >
                                Add column
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Column Dialog */}
            <Dialog
                open={!!editingColumn}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingColumn(null);
                        setNewColumnName('');
                        setNewColumnDescription('');
                        setNewColumnColor('#64748b');
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit column</DialogTitle>
                        <DialogDescription>
                            Update column details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-column-name">Name</Label>
                            <Input
                                id="edit-column-name"
                                placeholder="Column name"
                                value={newColumnName}
                                onChange={(e) =>
                                    setNewColumnName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveEditColumn();
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-column-description">
                                Description
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </Label>
                            <Textarea
                                id="edit-column-description"
                                placeholder="What is this column for?"
                                value={newColumnDescription}
                                onChange={(e) =>
                                    setNewColumnDescription(e.target.value)
                                }
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {columnColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewColumnColor(color)}
                                        className={`size-8 rounded-full transition-all hover:scale-110 ${
                                            newColumnColor === color
                                                ? 'ring-2 ring-primary ring-offset-2'
                                                : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setEditingColumn(null);
                                    setNewColumnName('');
                                    setNewColumnDescription('');
                                    setNewColumnColor('#64748b');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSaveEditColumn}
                                disabled={!newColumnName.trim()}
                            >
                                Save changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Task Sheet */}
            <Sheet
                open={isCreateTaskOpen}
                onOpenChange={(open) => {
                    setIsCreateTaskOpen(open);
                    if (!open) setSelectedColumnForTask(null);
                }}
            >
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
                                Add a new task to {project.name}
                                {selectedColumnForTask && (
                                    <span className="font-medium text-foreground">
                                        {' '}
                                        in "
                                        {
                                            kanbanColumns.find(
                                                (c) =>
                                                    c.id ===
                                                    selectedColumnForTask,
                                            )?.name
                                        }
                                        "
                                    </span>
                                )}
                                .
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
                                    disabled={!taskForm.title.trim()}
                                    onClick={handleCreateTask}
                                >
                                    Create task
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Column Details Drawer */}
            <Drawer
                open={!!selectedColumnForDetails}
                onOpenChange={(open) => {
                    if (!open) setSelectedColumnForDetails(null);
                }}
            >
                <DrawerContent className="h-[35vh]">
                    <AnimatePresence>
                        {selectedColumnForDetails && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="mx-auto flex h-full w-full max-w-3xl flex-col px-8 py-6"
                            >
                                {/* Header */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="flex items-start justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20,
                                                delay: 0.2,
                                            }}
                                            className="flex size-12 items-center justify-center rounded-xl text-xl font-bold text-white shadow-lg transition-transform duration-300 hover:scale-110"
                                            style={{
                                                backgroundColor:
                                                    selectedColumnForDetails?.color,
                                            }}
                                        >
                                            {selectedColumnForDetails
                                                ? project.task_lists?.find(
                                                      (tl) =>
                                                          tl.id ===
                                                          selectedColumnForDetails.id,
                                                  )?.tasks.length || 0
                                                : 0}
                                        </motion.div>
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {selectedColumnForDetails?.name}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedColumnForDetails?.description ||
                                                    'No description provided'}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.code
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="rounded-md bg-muted px-2 py-1 font-mono text-xs transition-colors hover:bg-muted/80"
                                    >
                                        {selectedColumnForDetails?.color}
                                    </motion.code>
                                </motion.div>

                                {/* Progress Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="mt-6 flex-1"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Task Progress
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {selectedColumnForDetails
                                                ? project.task_lists?.find(
                                                      (tl) =>
                                                          tl.id ===
                                                          selectedColumnForDetails.id,
                                                  )?.tasks.length || 0
                                                : 0}{' '}
                                            tasks total
                                        </span>
                                    </div>

                                    {/* Single stacked progress bar with smooth animation */}
                                    <div className="h-4 overflow-hidden rounded-full bg-muted">
                                        <div className="flex h-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '60%' }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.4,
                                                    ease: 'easeOut',
                                                }}
                                                className="h-full bg-green-500"
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '25%' }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.5,
                                                    ease: 'easeOut',
                                                }}
                                                className="h-full bg-amber-500"
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '15%' }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.6,
                                                    ease: 'easeOut',
                                                }}
                                                className="h-full bg-slate-400"
                                            />
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: 0.7,
                                        }}
                                        className="mt-4 flex items-center justify-center gap-8"
                                    >
                                        <div className="group flex cursor-default items-center gap-2 transition-transform hover:scale-105">
                                            <div className="size-3 rounded-full bg-green-500 transition-transform group-hover:scale-125" />
                                            <span className="text-sm">
                                                Completed
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                60%
                                            </span>
                                        </div>
                                        <div className="group flex cursor-default items-center gap-2 transition-transform hover:scale-105">
                                            <div className="size-3 rounded-full bg-amber-500 transition-transform group-hover:scale-125" />
                                            <span className="text-sm">
                                                In Progress
                                            </span>
                                            <span className="font-semibold text-amber-600">
                                                25%
                                            </span>
                                        </div>
                                        <div className="group flex cursor-default items-center gap-2 transition-transform hover:scale-105">
                                            <div className="size-3 rounded-full bg-slate-400 transition-transform group-hover:scale-125" />
                                            <span className="text-sm">
                                                Pending
                                            </span>
                                            <span className="font-semibold text-slate-600">
                                                15%
                                            </span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DrawerContent>
            </Drawer>

            {/* Delete Task Confirmation Dialog */}
            <AlertDialog
                open={!!deleteTask}
                onOpenChange={(open) => !open && setDeleteTask(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">
                                "{deleteTask?.title}"
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingTask}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTask}
                            disabled={isDeletingTask}
                            className="bg-red-600 font-medium text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Task Detail Sheet */}
            <Sheet
                open={!!selectedTask}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedTask(null);
                        setIsEditingTask(false);
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-xl"
                >
                    {selectedTask && (
                        <div className="py-6">
                            <SheetHeader className="text-left">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {isEditingTask ? (
                                            <Input
                                                value={editTaskForm.title}
                                                onChange={(e) =>
                                                    setEditTaskForm((prev) => ({
                                                        ...prev,
                                                        title: e.target.value,
                                                    }))
                                                }
                                                className="text-xl font-semibold"
                                                autoFocus
                                            />
                                        ) : (
                                            <SheetTitle className="text-xl">
                                                {selectedTask.title}
                                            </SheetTitle>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEditingTask ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setIsEditingTask(false);
                                                        setEditTaskForm({
                                                            title: selectedTask.title,
                                                            description:
                                                                selectedTask.description ||
                                                                '',
                                                            priority:
                                                                selectedTask.priority,
                                                            status: selectedTask.status,
                                                            due_date:
                                                                selectedTask.due_date ||
                                                                '',
                                                        });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleUpdateTask}
                                                    disabled={
                                                        !editTaskForm.title.trim()
                                                    }
                                                >
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setIsEditingTask(true)
                                                }
                                            >
                                                <Pencil className="mr-2 size-4" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="mt-8 space-y-6">
                                {/* Status */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </Label>
                                    {isEditingTask ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(
                                                [
                                                    'pending',
                                                    'in_progress',
                                                    'completed',
                                                    'cancelled',
                                                ] as const
                                            ).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() =>
                                                        setEditTaskForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                status,
                                                            }),
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                                        editTaskForm.status ===
                                                        status
                                                            ? 'border-primary bg-primary/10'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div
                                                        className="size-3 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                getStatusColor(
                                                                    status,
                                                                ),
                                                        }}
                                                    />
                                                    {getStatusLabel(status)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-3 rounded"
                                                style={{
                                                    backgroundColor:
                                                        getStatusColor(
                                                            selectedTask.status,
                                                        ),
                                                }}
                                            />
                                            <span>
                                                {getStatusLabel(
                                                    selectedTask.status,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Priority
                                    </Label>
                                    {isEditingTask ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(
                                                [
                                                    'low',
                                                    'medium',
                                                    'high',
                                                ] as const
                                            ).map((priority) => (
                                                <button
                                                    key={priority}
                                                    onClick={() =>
                                                        setEditTaskForm(
                                                            (prev) => ({
                                                                ...prev,
                                                                priority,
                                                            }),
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                                                        editTaskForm.priority ===
                                                        priority
                                                            ? 'border-primary bg-primary/10'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <div
                                                        className="size-3 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                getPriorityColor(
                                                                    priority,
                                                                ),
                                                        }}
                                                    />
                                                    {priority}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-3 rounded"
                                                style={{
                                                    backgroundColor:
                                                        getPriorityColor(
                                                            selectedTask.priority,
                                                        ),
                                                }}
                                            />
                                            <span className="capitalize">
                                                {selectedTask.priority}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Due Date */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Due Date
                                    </Label>
                                    {isEditingTask ? (
                                        <Input
                                            type="date"
                                            value={editTaskForm.due_date}
                                            onChange={(e) =>
                                                setEditTaskForm((prev) => ({
                                                    ...prev,
                                                    due_date: e.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <p>
                                            {selectedTask.due_date
                                                ? new Date(
                                                      selectedTask.due_date,
                                                  ).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          weekday: 'long',
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      },
                                                  )
                                                : 'No due date'}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </Label>
                                    {isEditingTask ? (
                                        <Textarea
                                            value={editTaskForm.description}
                                            onChange={(e) =>
                                                setEditTaskForm((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder="Add a description..."
                                            className="min-h-[120px] resize-none"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {selectedTask.description ||
                                                'No description'}
                                        </p>
                                    )}
                                </div>

                                {/* Meta Info */}
                                <div className="space-y-3 border-t pt-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Created
                                        </span>
                                        <span>
                                            {selectedTask.created_at
                                                ? new Date(
                                                      selectedTask.created_at,
                                                  ).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      },
                                                  )
                                                : '–'}
                                        </span>
                                    </div>
                                    {selectedTask.completed_at && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Completed
                                            </span>
                                            <span>
                                                {new Date(
                                                    selectedTask.completed_at,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 border-t pt-6">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            handleDuplicateTask(
                                                selectedTask.id,
                                            );
                                            setSelectedTask(null);
                                        }}
                                    >
                                        <Copy className="mr-2 size-4" />
                                        Duplicate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
                                        onClick={() => {
                                            setSelectedTask(null);
                                            handleDeleteTask(selectedTask);
                                        }}
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

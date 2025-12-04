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
    DndContext,
    KeyboardSensor,
    PointerSensor,
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
}: {
    column: KanbanColumn;
    headerContent: React.ReactNode;
    hasAnimated: boolean;
    index: number;
    onAddTask: () => void;
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
        mockTaskLists.map((l) => l.id),
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
                distance: 5,
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

    const handleAddTaskToColumn = (columnId: number) => {
        setSelectedColumnForTask(columnId);
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
                                    {kanbanColumns.map((column, index) => (
                                        <DraggableKanbanColumn
                                            key={column.id}
                                            column={column}
                                            hasAnimated={kanbanAnimated}
                                            index={index}
                                            onAddTask={() =>
                                                handleAddTaskToColumn(column.id)
                                            }
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
                                                            )?.tasks.length ||
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
                                                                    Edit column
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
                                    ))}
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
        </AppLayout>
    );
}

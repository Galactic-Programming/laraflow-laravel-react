import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export type TodoPriority = 'important' | 'new-product' | 'delayed' | 'normal';

export interface TodoAssignee {
    id: string;
    name: string;
    avatar?: string;
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
    priority?: TodoPriority;
    progress?: number;
    comments?: number;
    assignees?: TodoAssignee[];
    avatar?: string; // Legacy support
}

export interface PriorityConfig {
    label: string;
    className: string;
}

// =============================================================================
// Default Configurations
// =============================================================================

export const defaultPriorityConfig: Record<TodoPriority, PriorityConfig> = {
    important: {
        label: 'Important',
        className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    },
    'new-product': {
        label: 'New product',
        className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    },
    delayed: {
        label: 'Delayed',
        className: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
    },
    normal: {
        label: 'Normal',
        className: 'bg-muted text-muted-foreground',
    },
};

// =============================================================================
// Helper Functions
// =============================================================================

function getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-500';
    if (progress >= 50) return 'text-blue-500';
    if (progress >= 20) return 'text-amber-500';
    return 'text-red-500';
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// =============================================================================
// Sub-components
// =============================================================================

interface ProgressIndicatorProps {
    progress: number;
    className?: string;
}

export function ProgressIndicator({
    progress,
    className,
}: ProgressIndicatorProps) {
    const colorClass = getProgressColor(progress);

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div
                className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border-2',
                    colorClass,
                )}
            >
                <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <span className={cn('text-xs font-medium', colorClass)}>
                {progress}%
            </span>
        </div>
    );
}

interface AssigneeAvatarsProps {
    assignees?: TodoAssignee[];
    avatar?: string; // Legacy single avatar
    maxDisplay?: number;
    className?: string;
}

export function AssigneeAvatars({
    assignees,
    avatar,
    maxDisplay = 2,
    className,
}: AssigneeAvatarsProps) {
    // Handle legacy single avatar
    if (!assignees?.length && avatar) {
        return (
            <div className={cn('flex -space-x-1', className)}>
                <Avatar className="h-6 w-6 border border-background">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-blue-500 text-xs text-white">
                        {avatar[0]?.toUpperCase() ?? 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted">
                    <span className="text-xs text-muted-foreground">+3</span>
                </div>
            </div>
        );
    }

    if (!assignees?.length) return null;

    const displayed = assignees.slice(0, maxDisplay);
    const remaining = assignees.length - maxDisplay;

    return (
        <div className={cn('flex -space-x-1', className)}>
            {displayed.map((assignee) => (
                <Avatar
                    key={assignee.id}
                    className="h-6 w-6 border border-background"
                >
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback className="bg-blue-500 text-xs text-white">
                        {getInitials(assignee.name)}
                    </AvatarFallback>
                </Avatar>
            ))}
            {remaining > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-background bg-muted">
                    <span className="text-xs text-muted-foreground">
                        +{remaining}
                    </span>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export interface TodoItemProps {
    todo: Todo;
    onToggle?: (todo: Todo) => void;
    onEdit?: (todo: Todo) => void;
    onClick?: (todo: Todo) => void;
    priorityConfig?: Record<string, PriorityConfig>;
    showDragHandle?: boolean;
    showProgress?: boolean;
    showComments?: boolean;
    showAssignees?: boolean;
    renderActions?: (todo: Todo) => ReactNode;
    className?: string;
}

export function TodoItem({
    todo,
    onToggle,
    onEdit,
    onClick,
    priorityConfig = defaultPriorityConfig,
    showDragHandle = true,
    showProgress = true,
    showComments = true,
    showAssignees = true,
    renderActions,
    className,
}: TodoItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: todo.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityStyle = todo.priority ? priorityConfig[todo.priority] : null;

    const handleDoubleClick = () => {
        onEdit?.(todo);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3 transition-all hover:border-border',
                isDragging && 'opacity-50',
                onClick && 'cursor-pointer',
                className,
            )}
            onClick={() => onClick?.(todo)}
            onDoubleClick={handleDoubleClick}
        >
            {/* Drag Handle */}
            {showDragHandle && (
                <Button
                    ref={setActivatorNodeRef}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-3 w-3" />
                </Button>
            )}

            {/* Checkbox */}
            <Checkbox
                checked={todo.completed}
                onCheckedChange={() => onToggle?.(todo)}
                onClick={(e) => e.stopPropagation()}
            />

            {/* Text */}
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        'text-sm font-medium',
                        todo.completed && 'text-muted-foreground line-through',
                    )}
                >
                    {todo.text}
                </p>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-2">
                {/* Priority Badge */}
                {todo.priority && priorityStyle && (
                    <Badge
                        variant="secondary"
                        className={cn(
                            'border-0 text-xs font-medium',
                            priorityStyle.className,
                        )}
                    >
                        {priorityStyle.label}
                    </Badge>
                )}

                {/* Progress */}
                {showProgress && todo.progress !== undefined && (
                    <ProgressIndicator progress={todo.progress} />
                )}

                {/* Comments */}
                {showComments &&
                    todo.comments !== undefined &&
                    todo.comments > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageCircle className="h-3 w-3" />
                            <span className="text-xs">{todo.comments}</span>
                        </div>
                    )}

                {/* Assignees */}
                {showAssignees && (
                    <AssigneeAvatars
                        assignees={todo.assignees}
                        avatar={todo.avatar}
                    />
                )}

                {/* Custom Actions */}
                {renderActions?.(todo)}
            </div>
        </div>
    );
}

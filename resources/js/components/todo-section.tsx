import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Calendar, MoreHorizontal, Plus } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { TodoItem, type PriorityConfig, type Todo } from './todo-item';

// =============================================================================
// Types
// =============================================================================

export interface TodoSection {
    id: string;
    title: string;
    icon?: string;
    todos: Todo[];
}

// =============================================================================
// Sub-components
// =============================================================================

interface SectionHeaderProps {
    title: string;
    icon?: string;
    count?: number;
    showActions?: boolean;
    onCalendarClick?: () => void;
    onMoreClick?: () => void;
    onAddClick?: () => void;
    renderActions?: () => ReactNode;
}

function SectionHeader({
    title,
    icon,
    count,
    showActions = true,
    onCalendarClick,
    onMoreClick,
    onAddClick,
    renderActions,
}: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {icon && <span className="text-lg">{icon}</span>}
                <h2 className="font-semibold text-foreground">{title}</h2>
                {count !== undefined && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {count}
                    </span>
                )}
            </div>

            {showActions && (
                <div className="flex items-center gap-1">
                    {renderActions?.()}
                    {onAddClick && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={onAddClick}
                        >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                    {onCalendarClick && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={onCalendarClick}
                        >
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                    {onMoreClick && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={onMoreClick}
                        >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

interface EmptyStateProps {
    isOver?: boolean;
    emptyText?: string;
    dropText?: string;
}

function EmptyState({
    isOver,
    emptyText = 'No tasks',
    dropText = 'Drop task here',
}: EmptyStateProps) {
    return (
        <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
            {isOver ? dropText : emptyText}
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export interface TodoSectionProps {
    section: TodoSection;
    onToggleTodo?: (todo: Todo) => void;
    onEditTodo?: (todo: Todo) => void;
    onClickTodo?: (todo: Todo) => void;
    onAddTodo?: (sectionId: string) => void;
    onCalendarClick?: (sectionId: string) => void;
    onMoreClick?: (sectionId: string) => void;
    isDraggedOver?: boolean;
    priorityConfig?: Record<string, PriorityConfig>;
    showSectionActions?: boolean;
    showTodoProgress?: boolean;
    showTodoComments?: boolean;
    showTodoAssignees?: boolean;
    showCount?: boolean;
    emptyText?: string;
    dropText?: string;
    renderSectionActions?: (section: TodoSection) => ReactNode;
    renderTodoActions?: (todo: Todo) => ReactNode;
    className?: string;
}

export function TodoSectionCard({
    section,
    onToggleTodo,
    onEditTodo,
    onClickTodo,
    onAddTodo,
    onCalendarClick,
    onMoreClick,
    isDraggedOver = false,
    priorityConfig,
    showSectionActions = true,
    showTodoProgress = true,
    showTodoComments = true,
    showTodoAssignees = true,
    showCount = false,
    emptyText,
    dropText,
    renderSectionActions,
    renderTodoActions,
    className,
}: TodoSectionProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: section.id,
    });

    const isDropTarget = isOver || isDraggedOver;

    return (
        <Card
            className={cn(
                'border-0 bg-card p-4 shadow-sm transition-colors',
                isDropTarget && 'bg-primary/5 ring-2 ring-primary/50',
                className,
            )}
        >
            <div ref={setNodeRef} className="space-y-4">
                {/* Header */}
                <SectionHeader
                    title={section.title}
                    icon={section.icon}
                    count={showCount ? section.todos.length : undefined}
                    showActions={showSectionActions}
                    onAddClick={
                        onAddTodo ? () => onAddTodo(section.id) : undefined
                    }
                    onCalendarClick={
                        onCalendarClick
                            ? () => onCalendarClick(section.id)
                            : undefined
                    }
                    onMoreClick={
                        onMoreClick ? () => onMoreClick(section.id) : undefined
                    }
                    renderActions={
                        renderSectionActions
                            ? () => renderSectionActions(section)
                            : undefined
                    }
                />

                {/* Todo List */}
                <SortableContext
                    items={section.todos.map((todo) => todo.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        className={cn(
                            'min-h-[100px] space-y-2 rounded-md transition-colors',
                            isDropTarget &&
                                section.todos.length === 0 &&
                                'border-2 border-dashed border-primary/30 bg-primary/5',
                        )}
                    >
                        {section.todos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={onToggleTodo}
                                onEdit={onEditTodo}
                                onClick={onClickTodo}
                                priorityConfig={priorityConfig}
                                showProgress={showTodoProgress}
                                showComments={showTodoComments}
                                showAssignees={showTodoAssignees}
                                renderActions={renderTodoActions}
                            />
                        ))}
                        {section.todos.length === 0 && (
                            <EmptyState
                                isOver={isDropTarget}
                                emptyText={emptyText}
                                dropText={dropText}
                            />
                        )}
                    </div>
                </SortableContext>
            </div>
        </Card>
    );
}

// Export sub-components and legacy name
export { EmptyState, SectionHeader };

// Legacy export for backward compatibility
export { TodoSectionCard as TodoSection };

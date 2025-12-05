import * as React from 'react';

import * as Kanban from '@/components/kanban';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, XIcon } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    dueDate?: string;
}

export default function KanbanRender() {
    const [columns, setColumns] = React.useState<Record<string, Task[]>>({});
    const [columnTitles, setColumnTitles] = React.useState<
        Record<string, string>
    >({});
    const [isAddingColumn, setIsAddingColumn] = React.useState(false);
    const [newColumnTitle, setNewColumnTitle] = React.useState('');

    const handleAddColumn = () => {
        if (!newColumnTitle.trim()) return;

        const columnId = `column-${Date.now()}`;
        setColumns((prev) => ({ ...prev, [columnId]: [] }));
        setColumnTitles((prev) => ({
            ...prev,
            [columnId]: newColumnTitle.trim(),
        }));
        setNewColumnTitle('');
        setIsAddingColumn(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddColumn();
        } else if (e.key === 'Escape') {
            setIsAddingColumn(false);
            setNewColumnTitle('');
        }
    };

    return (
        <div className="p-6">
            <Kanban.Root
                value={columns}
                onValueChange={setColumns}
                getItemValue={(item: Task) => item.id}
            >
                <div className="flex gap-4">
                    <Kanban.Board className="flex gap-4">
                        {Object.entries(columns).map(([columnValue, tasks]) => (
                            <Kanban.Column
                                key={columnValue}
                                value={columnValue}
                                className="w-72 shrink-0"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">
                                            {columnTitles[columnValue]}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="pointer-events-none rounded-sm"
                                        >
                                            {tasks.length}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 p-0.5">
                                    {tasks.map((task) => (
                                        <Kanban.Item
                                            key={task.id}
                                            value={task.id}
                                            asHandle
                                            asChild
                                        >
                                            <div className="rounded-md border bg-card p-3 shadow-xs">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="line-clamp-1 text-sm font-medium">
                                                            {task.title}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                task.priority ===
                                                                'high'
                                                                    ? 'destructive'
                                                                    : task.priority ===
                                                                        'medium'
                                                                      ? 'default'
                                                                      : 'secondary'
                                                            }
                                                            className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
                                                        >
                                                            {task.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        {task.assignee && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="size-2 rounded-full bg-primary/20" />
                                                                <span className="line-clamp-1">
                                                                    {
                                                                        task.assignee
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {task.dueDate && (
                                                            <time className="text-[10px] tabular-nums">
                                                                {task.dueDate}
                                                            </time>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Kanban.Item>
                                    ))}
                                </div>
                            </Kanban.Column>
                        ))}
                    </Kanban.Board>

                    {/* Add Column Button/Form */}
                    <div className="w-72 shrink-0">
                        {isAddingColumn ? (
                            <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-3">
                                <Input
                                    autoFocus
                                    placeholder="Enter column title..."
                                    value={newColumnTitle}
                                    onChange={(e) =>
                                        setNewColumnTitle(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleAddColumn}>
                                        Add Column
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsAddingColumn(false);
                                            setNewColumnTitle('');
                                        }}
                                    >
                                        <XIcon className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-auto w-full justify-start gap-2 p-3"
                                onClick={() => setIsAddingColumn(true)}
                            >
                                <PlusIcon className="size-4" />
                                Add Column
                            </Button>
                        )}
                    </div>
                </div>
                <Kanban.Overlay>
                    <div className="size-full rounded-md bg-primary/10" />
                </Kanban.Overlay>
            </Kanban.Root>
        </div>
    );
}

import { Task } from '@/components/data/schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Calendar } from 'lucide-react';

interface TaskDetailSheetProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({
    task,
    open,
    onOpenChange,
}: TaskDetailSheetProps) {
    if (!task) return null;

    const getStatusColor = (status: string) => {
        const colors = {
            pending: '#a855f7',
            in_progress: '#3b82f6',
            completed: '#22c55e',
            cancelled: '#ef4444',
        };
        return colors[status as keyof typeof colors] || '#6b7280';
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return labels[status as keyof typeof labels] || status;
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: '#22c55e',
            medium: '#f59e0b',
            high: '#ef4444',
        };
        return colors[priority as keyof typeof colors] || '#6b7280';
    };

    const getPriorityLabel = (priority: string) => {
        const labels = {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
        };
        return labels[priority as keyof typeof labels] || priority;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full overflow-y-auto sm:max-w-2xl"
            >
                <div className="mx-auto max-w-lg py-6">
                    <SheetHeader className="text-left">
                        <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                            Task Details
                        </SheetTitle>
                        <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                            View all information about this task
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-10 space-y-8">
                        {/* Title */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '100ms' }}
                        >
                            <Label className="text-base">Title</Label>
                            <div className="rounded-lg border bg-muted/50 px-4 py-3 text-lg font-medium">
                                {task.title}
                            </div>
                        </div>

                        {/* Description */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '200ms' }}
                        >
                            <Label className="text-base">Description</Label>
                            <div className="min-h-[120px] rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                                {task.description || 'No description provided'}
                            </div>
                        </div>

                        {/* Status */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '300ms' }}
                        >
                            <Label className="text-base">Status</Label>
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                                <div
                                    className="size-3 rounded-full"
                                    style={{
                                        backgroundColor: getStatusColor(
                                            task.status,
                                        ),
                                    }}
                                />
                                <span className="font-medium">
                                    {getStatusLabel(task.status)}
                                </span>
                            </div>
                        </div>

                        {/* Priority */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '400ms' }}
                        >
                            <Label className="text-base">Priority</Label>
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                                <div
                                    className="size-3 rounded-full"
                                    style={{
                                        backgroundColor: getPriorityColor(
                                            task.priority,
                                        ),
                                    }}
                                />
                                <span className="font-medium">
                                    {getPriorityLabel(task.priority)}
                                </span>
                            </div>
                        </div>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '450ms' }}
                            >
                                <Label className="text-base">Labels</Label>
                                <div className="flex flex-wrap gap-2">
                                    {task.labels.map((label) => (
                                        <div
                                            key={label.id}
                                            className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5"
                                        >
                                            <div
                                                className="size-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        label.color,
                                                }}
                                            />
                                            <span className="text-sm font-medium">
                                                {label.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Date */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '500ms' }}
                        >
                            <Label className="text-base">Due Date</Label>
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                                <Calendar className="size-5 text-muted-foreground" />
                                <span className="font-medium">
                                    {task.due_date
                                        ? (() => {
                                              const [year, month, day] =
                                                  task.due_date
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
                                        : 'No due date set'}
                                </span>
                            </div>
                        </div>

                        {/* Created At */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '550ms' }}
                        >
                            <Label className="text-base">Created</Label>
                            <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                                {new Date(task.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },
                                )}
                            </div>
                        </div>

                        {/* Updated At */}
                        <div
                            className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                            style={{ animationDelay: '600ms' }}
                        >
                            <Label className="text-base">Last Updated</Label>
                            <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                                {new Date(task.updated_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },
                                )}
                            </div>
                        </div>

                        {/* Completed At */}
                        {task.completed_at && (
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '650ms' }}
                            >
                                <Label className="text-base">Completed</Label>
                                <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                                    {new Date(
                                        task.completed_at,
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div
                            className="flex animate-in gap-4 pt-6 duration-500 fill-mode-both fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: '700ms' }}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="flex-1 transition-all duration-200 hover:shadow-md"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

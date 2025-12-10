import { Row } from '@tanstack/react-table';
import { Calendar, MoreHorizontal } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
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
import { router } from '@inertiajs/react';
import { useState } from 'react';

import { labels } from '../data/data.js';
import { taskSchema } from '../data/schema';

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const task = taskSchema.parse(row.original);
    const [taskLabels, setTaskLabels] = useState(task.labels || []);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [editForm, setEditForm] = useState({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || '',
    });

    const isLabelSelected = (labelValue: string) => {
        // Only one label can be selected, check if this is the one
        return taskLabels.length === 1 && taskLabels[0].name === labelValue;
    };

    const getLabelIdByValue = (labelValue: string) => {
        // Map label values to IDs (these should match your database)
        const labelMap: Record<string, number> = {
            bug: 1,
            feature: 2,
            enhancement: 3,
            documentation: 4,
            testing: 5,
            refactor: 6,
            urgent: 7,
            blocked: 8,
            needs_review: 9,
            in_review: 10,
            approved: 11,
            other: 12,
        };
        return labelMap[labelValue];
    };

    const getLabelColor = (labelValue: string) => {
        const colorMap: Record<string, string> = {
            bug: '#ef4444',
            feature: '#3b82f6',
            enhancement: '#10b981',
            documentation: '#f59e0b',
            testing: '#a855f7',
            refactor: '#fb923c',
            urgent: '#dc2626',
            blocked: '#1f2937',
            needs_review: '#06b6d4',
            in_review: '#6366f1',
            approved: '#22c55e',
            other: '#6b7280',
        };
        return colorMap[labelValue] || '#6b7280';
    };

    const toggleLabel = (labelValue: string) => {
        if (isLoading) return;

        const labelId = getLabelIdByValue(labelValue);
        const isCurrentlySelected = isLabelSelected(labelValue);

        setIsLoading(true);

        router.post(
            `/tasks/${task.id}/labels/toggle`,
            { label_id: labelId },
            {
                preserveScroll: true,
                preserveState: false, // Reload to get updated data
                onSuccess: () => {
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Failed to toggle label:', errors);
                    setIsLoading(false);
                },
            },
        );
    };

    const handleDelete = () => {
        console.log('Deleting task with ID:', task.id);
        console.log('Full task object:', task);

        router.delete(`/tasks/${task.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Task deleted successfully');
                setShowDeleteDialog(false);
            },
            onError: (errors) => {
                console.error('Failed to delete task:', errors);
            },
        });
    };

    const handleEdit = () => {
        if (!editForm.title.trim()) {
            return;
        }

        router.put(
            `/tasks/${task.id}`,
            {
                title: editForm.title,
                description: editForm.description || null,
                priority: editForm.priority,
                status: editForm.status,
                due_date: editForm.due_date || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Task updated successfully');
                    setShowEditSheet(false);
                },
                onError: (errors) => {
                    console.error('Failed to update task:', errors);
                },
            },
        );
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 data-[state=open]:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEditSheet(true);
                        }}
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-[200px]">
                            {labels.map((label) => (
                                <DropdownMenuItem
                                    key={label.value}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleLabel(label.value);
                                    }}
                                    className="flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    <Checkbox
                                        checked={isLabelSelected(label.value)}
                                        className="h-4 w-4"
                                    />
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor: getLabelColor(
                                                label.value,
                                            ),
                                        }}
                                    />
                                    <span>{label.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteDialog(true);
                        }}
                    >
                        Delete
                        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">
                                "{task.title}"
                            </span>
                            ? This action cannot be undone and all associated
                            data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Task Sheet */}
            <Sheet
                open={showEditSheet}
                onOpenChange={(open) => {
                    setShowEditSheet(open);
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                    onPointerDownOutside={(e) => e.stopPropagation()}
                    onInteractOutside={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto max-w-lg py-6">
                        <SheetHeader className="text-left">
                            <SheetTitle className="animate-in text-2xl duration-500 fade-in slide-in-from-right-4">
                                Edit Task
                            </SheetTitle>
                            <SheetDescription className="animate-in text-muted-foreground delay-75 duration-500 fade-in slide-in-from-right-4">
                                Update task details below
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
                                    Task Title
                                </Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
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
                                    htmlFor="edit-description"
                                    className="text-base"
                                >
                                    Description
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="What needs to be done?"
                                    className="min-h-[120px] resize-none text-base transition-shadow duration-200 focus:shadow-lg focus:shadow-primary/10"
                                />
                            </div>

                            {/* Status */}
                            <div
                                className="animate-in space-y-3 duration-500 fill-mode-both fade-in slide-in-from-right-4"
                                style={{ animationDelay: '300ms' }}
                            >
                                <Label className="text-base">Status</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            value: 'pending',
                                            label: 'Pending',
                                            color: '#a855f7',
                                        },
                                        {
                                            value: 'in_progress',
                                            label: 'In Progress',
                                            color: '#3b82f6',
                                        },
                                        {
                                            value: 'completed',
                                            label: 'Completed',
                                            color: '#22c55e',
                                        },
                                        {
                                            value: 'cancelled',
                                            label: 'Cancelled',
                                            color: '#ef4444',
                                        },
                                    ].map((status) => (
                                        <button
                                            key={status.value}
                                            type="button"
                                            onClick={() =>
                                                setEditForm((prev) => ({
                                                    ...prev,
                                                    status: status.value as
                                                        | 'pending'
                                                        | 'in_progress'
                                                        | 'completed'
                                                        | 'cancelled',
                                                }))
                                            }
                                            className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                                                editForm.status === status.value
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
                                <Label className="text-base">Priority</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditForm((prev) => ({
                                                ...prev,
                                                priority: 'low',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            editForm.priority === 'low'
                                                ? 'border-green-500 bg-green-500/5 shadow-md'
                                                : 'border-border hover:border-green-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-green-500 transition-transform duration-200 ${
                                                editForm.priority === 'low'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                editForm.priority === 'low'
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
                                            setEditForm((prev) => ({
                                                ...prev,
                                                priority: 'medium',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            editForm.priority === 'medium'
                                                ? 'border-amber-500 bg-amber-500/5 shadow-md'
                                                : 'border-border hover:border-amber-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-amber-500 transition-transform duration-200 ${
                                                editForm.priority === 'medium'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                editForm.priority === 'medium'
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
                                            setEditForm((prev) => ({
                                                ...prev,
                                                priority: 'high',
                                            }))
                                        }
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-md ${
                                            editForm.priority === 'high'
                                                ? 'border-red-500 bg-red-500/5 shadow-md'
                                                : 'border-border hover:border-red-500/30 hover:bg-muted/50'
                                        }`}
                                    >
                                        <div
                                            className={`size-3 rounded-full bg-red-500 transition-transform duration-200 ${
                                                editForm.priority === 'high'
                                                    ? 'scale-125'
                                                    : ''
                                            }`}
                                        />
                                        <p
                                            className={`font-medium ${
                                                editForm.priority === 'high'
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
                                <Label className="text-base">
                                    Due date
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`h-12 w-full justify-start text-left text-base font-normal transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/10 ${
                                                !editForm.due_date &&
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            <Calendar className="mr-3 size-5" />
                                            {editForm.due_date
                                                ? (() => {
                                                      const [year, month, day] =
                                                          editForm.due_date
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
                                                : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <CalendarPicker
                                            mode="single"
                                            selected={
                                                editForm.due_date
                                                    ? (() => {
                                                          const [
                                                              year,
                                                              month,
                                                              day,
                                                          ] = editForm.due_date
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
                                                setEditForm((prev) => ({
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
                                    onClick={() => setShowEditSheet(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                    disabled={!editForm.title}
                                    onClick={handleEdit}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}

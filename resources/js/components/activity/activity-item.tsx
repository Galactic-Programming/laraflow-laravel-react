import {
    ActivityStatusBadge,
    ActivityTagList,
} from '@/components/activity/activity-badge';
import {
    ActivityIcon,
    shouldShowIcon,
} from '@/components/activity/activity-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
    Activity,
    ActivityChange,
    ActivityItemProps,
} from '@/types/activity';
import { getInitials } from '@/types/activity';
import { ArrowRight, CheckSquare, FolderKanban, ListTodo } from 'lucide-react';

/**
 * Component to display a single field change
 */
function ChangeItem({ change }: { change: ActivityChange }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-muted-foreground">
                {change.fieldLabel}:
            </span>
            {change.oldValue && (
                <>
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700 line-through dark:bg-red-900/30 dark:text-red-400">
                        {change.oldValue}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
            )}
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {change.newValue ?? 'None'}
            </span>
        </div>
    );
}

/**
 * Component to display all changes in an activity
 */
function ChangesList({ changes }: { changes: ActivityChange[] }) {
    if (!changes || changes.length === 0) return null;

    return (
        <div className="mt-2 space-y-1.5 rounded-lg border border-border/50 bg-muted/30 p-2 md:mt-3 md:p-3">
            {changes.map((change, index) => (
                <ChangeItem key={`${change.field}-${index}`} change={change} />
            ))}
        </div>
    );
}

/**
 * Get subject type icon and label
 */
function getSubjectTypeInfo(subjectType: string): {
    icon: React.ReactNode;
    label: string;
    color: string;
} {
    switch (subjectType) {
        case 'project':
            return {
                icon: <FolderKanban className="h-3 w-3" />,
                label: 'Project',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            };
        case 'task_list':
            return {
                icon: <ListTodo className="h-3 w-3" />,
                label: 'Task List',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            };
        case 'task':
            return {
                icon: <CheckSquare className="h-3 w-3" />,
                label: 'Task',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            };
        default:
            return {
                icon: null,
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
            };
    }
}

/**
 * Renders a single activity item in the feed
 */
export function ActivityItem({
    activity,
    showDateHeader = false,
    className,
}: ActivityItemProps) {
    const {
        type,
        subjectType,
        user,
        action,
        target,
        status,
        tags,
        comment,
        assignee,
        changes,
        timestamp,
        date,
    } = activity;

    const initials = user.initials ?? getInitials(user.name);
    const showIcon = shouldShowIcon(type);
    const subjectInfo = getSubjectTypeInfo(subjectType);

    return (
        <div className={cn(className)}>
            {/* Date Header */}
            {showDateHeader && (
                <div className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase md:mb-4 md:text-sm">
                    {date}
                </div>
            )}

            {/* Activity Item */}
            <div className="relative flex gap-2 md:gap-3">
                {/* Timeline Line */}
                <div className="absolute top-10 bottom-0 left-3 w-px bg-border md:top-12 md:left-4" />

                {/* Avatar or Icon */}
                <div className="relative z-10">
                    {showIcon ? (
                        <ActivityIcon type={type} size="md" />
                    ) : (
                        <Avatar className="h-6 w-6 md:h-8 md:w-8">
                            <AvatarImage
                                src={user.avatar ?? undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-2 md:text-sm">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="font-medium text-foreground">
                                {user.name}
                            </span>
                            <span className="text-muted-foreground">
                                {action}
                            </span>

                            {target && (
                                <span className="font-medium text-foreground">
                                    "{target}"
                                </span>
                            )}

                            {status && (
                                <>
                                    <ActivityStatusBadge status={status} />
                                </>
                            )}

                            {assignee && (
                                <>
                                    <span className="text-muted-foreground">
                                        to
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {assignee}
                                    </span>
                                </>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground sm:ml-auto md:text-sm">
                            {timestamp}
                        </span>
                    </div>

                    {/* Subject Type Badge */}
                    {subjectType && subjectType !== 'unknown' && (
                        <div className="mt-1">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    'gap-1 text-xs',
                                    subjectInfo.color,
                                )}
                            >
                                {subjectInfo.icon}
                                {subjectInfo.label}
                            </Badge>
                        </div>
                    )}

                    {/* Tags */}
                    <ActivityTagList tags={tags ?? []} />

                    {/* Detailed Changes */}
                    {changes && changes.length > 0 && (
                        <ChangesList changes={changes} />
                    )}

                    {/* Comment */}
                    {comment && (
                        <div className="mt-2 rounded-lg bg-muted p-2 text-xs leading-relaxed text-muted-foreground md:mt-3 md:p-3 md:text-sm">
                            {comment}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Renders a list of activity items grouped by date
 */
export interface ActivityListProps {
    activities: Activity[];
    className?: string;
}

export function ActivityList({ activities, className }: ActivityListProps) {
    let currentDate = '';

    return (
        <div className={cn('space-y-4 md:space-y-6', className)}>
            {activities.map((activity) => {
                const showDateHeader = currentDate !== activity.date;
                if (showDateHeader) {
                    currentDate = activity.date;
                }

                return (
                    <ActivityItem
                        key={activity.id}
                        activity={activity}
                        showDateHeader={showDateHeader}
                    />
                );
            })}
        </div>
    );
}

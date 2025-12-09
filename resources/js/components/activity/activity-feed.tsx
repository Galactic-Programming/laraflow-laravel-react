import { ActivityList } from '@/components/activity/activity-item';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ActivityFeedProps } from '@/types/activity';
import { Filter, Inbox } from 'lucide-react';

/**
 * Loading skeleton for activity feed
 */
function ActivityFeedSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Main ActivityFeed component
 *
 * @example
 * // Basic usage with data from backend
 * <ActivityFeed
 *   activities={activities}
 *   title="Activity Log"
 * />
 *
 * @example
 * // With filter controls
 * <ActivityFeed
 *   activities={activities}
 *   showMentionedOnly={mentionedOnly}
 *   onFilterChange={setMentionedOnly}
 * />
 */
export function ActivityFeed({
    activities,
    showMentionedOnly = false,
    onFilterChange,
    title = 'Activity log',
    className,
    emptyMessage = 'No activities found',
    loading = false,
}: ActivityFeedProps) {
    return (
        <div className={cn('mx-auto max-w-4xl p-4 md:p-6', className)}>
            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center md:mb-8">
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                    {title}
                </h1>
                <div className="flex items-center gap-3 md:gap-4">
                    {onFilterChange && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground md:text-sm">
                                Show mentioned only
                            </span>
                            <Switch
                                checked={showMentionedOnly}
                                onCheckedChange={onFilterChange}
                            />
                        </div>
                    )}
                    <Button variant="ghost" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <ActivityFeedSkeleton />
            ) : activities.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <Inbox className="h-12 w-12 text-muted-foreground" />
                        <EmptyTitle>{emptyMessage}</EmptyTitle>
                        <EmptyDescription>
                            When there are activities, they will appear here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <ActivityList activities={activities} />
            )}
        </div>
    );
}

// Re-export all activity components for convenience
export * from '@/components/activity/activity-badge';
export * from '@/components/activity/activity-icon';
export * from '@/components/activity/activity-item';

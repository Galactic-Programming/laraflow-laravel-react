import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    ACTIVITY_COLORS,
    type ActivityStatus,
    type ActivityTag,
} from '@/types/activity';

export interface ActivityStatusBadgeProps {
    status: ActivityStatus;
    className?: string;
}

/**
 * Badge component for displaying activity status
 */
export function ActivityStatusBadge({
    status,
    className,
}: ActivityStatusBadgeProps) {
    const colors = ACTIVITY_COLORS[status.color] ?? ACTIVITY_COLORS.default;

    return (
        <Badge
            variant="secondary"
            className={cn(colors.bg, colors.text, 'gap-1.5 text-xs', className)}
        >
            <div
                className={cn(
                    'h-1.5 w-1.5 rounded-full md:h-2 md:w-2',
                    colors.dot,
                )}
            />
            {status.text}
        </Badge>
    );
}

export interface ActivityTagBadgeProps {
    tag: ActivityTag;
    className?: string;
}

/**
 * Badge component for displaying activity tags
 */
export function ActivityTagBadge({ tag, className }: ActivityTagBadgeProps) {
    // Check if color is hex (starts with #) or predefined color name
    const isHexColor = tag.color.startsWith('#');
    const colors = isHexColor
        ? null
        : (ACTIVITY_COLORS[tag.color] ?? ACTIVITY_COLORS.default);
    const displayText = tag.text || tag.name || 'Unknown';

    return (
        <Badge
            variant="secondary"
            className={cn(
                'gap-1.5 text-xs',
                tag.removed
                    ? 'bg-red-100 text-red-700 line-through dark:bg-red-900/30 dark:text-red-400'
                    : tag.added
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-muted text-muted-foreground',
                className,
            )}
        >
            <div
                className={cn(
                    'h-1.5 w-1.5 rounded-full md:h-2 md:w-2',
                    isHexColor ? '' : colors?.dot,
                )}
                style={isHexColor ? { backgroundColor: tag.color } : undefined}
            />
            {displayText}
        </Badge>
    );
}

export interface ActivityTagListProps {
    tags: ActivityTag[];
    className?: string;
}

/**
 * Component for displaying a list of activity tags
 */
export function ActivityTagList({ tags, className }: ActivityTagListProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className={cn('mt-2 flex flex-wrap gap-2', className)}>
            {tags.map((tag, index) => (
                <ActivityTagBadge key={tag.id ?? index} tag={tag} />
            ))}
        </div>
    );
}

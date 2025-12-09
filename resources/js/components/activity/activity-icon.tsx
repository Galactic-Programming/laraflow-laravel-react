import { cn } from '@/lib/utils';
import type { ActivityType } from '@/types/activity';
import {
    FileText,
    GitBranch,
    MessageSquare,
    Pencil,
    Plus,
    Tag,
    Trash2,
    User,
    type LucideIcon,
} from 'lucide-react';

/**
 * Icon configuration for each activity type
 */
const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
    status_change: GitBranch,
    comment: MessageSquare,
    mention: MessageSquare,
    tag_added: Tag,
    file_added: FileText,
    assignment: User,
    created: Plus,
    updated: Pencil,
    deleted: Trash2,
};

export interface ActivityIconProps {
    type: ActivityType;
    className?: string;
    containerClassName?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: {
        container: 'h-6 w-6',
        icon: 'h-3 w-3',
    },
    md: {
        container: 'h-8 w-8',
        icon: 'h-4 w-4',
    },
    lg: {
        container: 'h-10 w-10',
        icon: 'h-5 w-5',
    },
};

/**
 * Renders an icon for a specific activity type
 */
export function ActivityIcon({
    type,
    className,
    containerClassName,
    size = 'md',
}: ActivityIconProps) {
    const Icon = ACTIVITY_ICONS[type] ?? MessageSquare;
    const sizes = sizeClasses[size];

    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full bg-muted',
                sizes.container,
                containerClassName,
            )}
        >
            <Icon
                className={cn('text-muted-foreground', sizes.icon, className)}
            />
        </div>
    );
}

/**
 * Check if an activity type should show an icon instead of avatar
 */
export function shouldShowIcon(type: ActivityType): boolean {
    return ['tag_added', 'file_added', 'created', 'deleted'].includes(type);
}

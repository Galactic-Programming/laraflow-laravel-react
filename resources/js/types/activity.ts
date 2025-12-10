import type { User } from '@/types';

/**
 * Activity types supported by the system
 */
export type ActivityType =
    | 'status_change'
    | 'comment'
    | 'mention'
    | 'tag_added'
    | 'file_added'
    | 'assignment'
    | 'created'
    | 'updated'
    | 'deleted';

/**
 * Color variants for status and tags
 */
export type ActivityColor =
    | 'default'
    | 'green'
    | 'blue'
    | 'red'
    | 'orange'
    | 'purple'
    | 'yellow';

/**
 * Status information within an activity
 */
export interface ActivityStatus {
    text: string;
    color: ActivityColor;
}

/**
 * Tag information within an activity
 */
export interface ActivityTag {
    id?: number;
    text?: string;
    name?: string;
    color: ActivityColor | string; // Support both predefined colors and hex colors
    added?: boolean;
    removed?: boolean;
}

/**
 * Simplified user info for activity display
 */
export interface ActivityUser {
    id?: number;
    name: string;
    initials?: string;
    avatar?: string | null;
}

/**
 * Represents a single field change
 */
export interface ActivityChange {
    field: string;
    fieldLabel: string;
    oldValue: string | null;
    newValue: string | null;
}

/**
 * Subject type for categorization
 */
export type ActivitySubjectType = 'project' | 'task_list' | 'task' | 'unknown';

/**
 * Main Activity interface - represents a single activity log entry
 */
export interface Activity {
    id: string | number;
    type: ActivityType;
    subjectType: ActivitySubjectType;
    user: ActivityUser;
    action: string;
    target?: string;
    targetUrl?: string;
    status?: ActivityStatus;
    tags?: ActivityTag[];
    comment?: string;
    assignee?: string;
    fileName?: string;
    changes?: ActivityChange[];
    timestamp: string;
    date: string;
    createdAt?: string;
}

/**
 * Props for ActivityFeed component
 */
export interface ActivityFeedProps {
    activities: Activity[];
    showMentionedOnly?: boolean;
    onFilterChange?: (mentionedOnly: boolean) => void;
    title?: string;
    className?: string;
    emptyMessage?: string;
    loading?: boolean;
}

/**
 * Props for ActivityItem component
 */
export interface ActivityItemProps {
    activity: Activity;
    showDateHeader?: boolean;
    className?: string;
}

/**
 * Color configuration for consistent styling
 */
export const ACTIVITY_COLORS: Record<
    ActivityColor,
    { bg: string; text: string; dot: string }
> = {
    default: {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        dot: 'bg-gray-500',
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        dot: 'bg-green-500',
    },
    blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        dot: 'bg-blue-500',
    },
    red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        dot: 'bg-red-500',
    },
    orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-300',
        dot: 'bg-orange-500',
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
        dot: 'bg-purple-500',
    },
    yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-300',
        dot: 'bg-yellow-500',
    },
};

/**
 * Helper function to get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Helper function to format activity from backend User to ActivityUser
 */
export function toActivityUser(user: Partial<User>): ActivityUser {
    return {
        id: user.id,
        name: user.name ?? 'Unknown',
        initials: user.name ? getInitials(user.name) : '?',
        avatar: user.avatar ?? null,
    };
}

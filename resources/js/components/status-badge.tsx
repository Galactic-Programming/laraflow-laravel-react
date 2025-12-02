import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
    CheckCircleIcon,
    CircleIcon,
    CircleDotIcon,
    XCircleIcon,
    PauseCircleIcon,
    AlertCircleIcon,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * Types & Constants
 * -------------------------------------------------------------------------- */

/**
 * Available status types for the StatusBadge component.
 * Maps to common task/project management statuses.
 */
export type StatusType =
    | "todo"
    | "in_progress"
    | "done"
    | "cancelled"
    | "on_hold"
    | "pending";

/**
 * Configuration for each status type including display properties.
 */
export interface StatusConfig {
    /** Display label for the status */
    label: string;
    /** Icon component to display */
    icon: LucideIcon;
    /** Tailwind classes for icon color */
    iconClassName: string;
    /** Tailwind classes for badge background/border */
    badgeClassName: string;
}

/**
 * Default configuration for all status types.
 * Can be overridden via props.
 */
export const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
    todo: {
        label: "To Do",
        icon: CircleIcon,
        iconClassName: "text-muted-foreground",
        badgeClassName: "border-muted-foreground/30 bg-muted/50",
    },
    in_progress: {
        label: "In Progress",
        icon: CircleDotIcon,
        iconClassName: "text-blue-500 dark:text-blue-400",
        badgeClassName: "border-blue-500/30 bg-blue-500/10 dark:border-blue-400/30 dark:bg-blue-400/10",
    },
    done: {
        label: "Done",
        icon: CheckCircleIcon,
        iconClassName: "text-green-600 dark:text-green-400",
        badgeClassName: "border-green-600/30 bg-green-600/10 dark:border-green-400/30 dark:bg-green-400/10",
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircleIcon,
        iconClassName: "text-red-500 dark:text-red-400",
        badgeClassName: "border-red-500/30 bg-red-500/10 dark:border-red-400/30 dark:bg-red-400/10",
    },
    on_hold: {
        label: "On Hold",
        icon: PauseCircleIcon,
        iconClassName: "text-amber-500 dark:text-amber-400",
        badgeClassName: "border-amber-500/30 bg-amber-500/10 dark:border-amber-400/30 dark:bg-amber-400/10",
    },
    pending: {
        label: "Pending",
        icon: AlertCircleIcon,
        iconClassName: "text-orange-500 dark:text-orange-400",
        badgeClassName: "border-orange-500/30 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-400/10",
    },
};

/* -----------------------------------------------------------------------------
 * Badge Variants
 * -------------------------------------------------------------------------- */

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            size: {
                sm: "px-1.5 py-0.5 text-[10px] [&>svg]:size-2.5",
                md: "px-2 py-0.5 text-xs [&>svg]:size-3",
                lg: "px-2.5 py-1 text-sm [&>svg]:size-3.5",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

/* -----------------------------------------------------------------------------
 * StatusBadge Component
 * -------------------------------------------------------------------------- */

export interface StatusBadgeProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
    /** The status type to display */
    status: StatusType;
    /** Custom label to override the default */
    label?: string;
    /** Custom icon to override the default */
    icon?: LucideIcon;
    /** Whether to show the icon */
    showIcon?: boolean;
    /** Custom status configuration to extend/override defaults */
    customConfig?: Partial<Record<StatusType, Partial<StatusConfig>>>;
}

/**
 * A reusable status badge component for displaying task/project statuses.
 *
 * @example
 * // Basic usage
 * <StatusBadge status="done" />
 *
 * @example
 * // With custom label
 * <StatusBadge status="in_progress" label="Working" />
 *
 * @example
 * // Without icon
 * <StatusBadge status="todo" showIcon={false} />
 *
 * @example
 * // Different sizes
 * <StatusBadge status="pending" size="lg" />
 */
const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
    (props, ref) => {
        const {
            status,
            label,
            icon: IconOverride,
            showIcon = true,
            size,
            customConfig,
            className,
            ...badgeProps
        } = props;

        // Merge custom config with defaults
        const config = {
            ...STATUS_CONFIG[status],
            ...customConfig?.[status],
        };

        const Icon = IconOverride ?? config.icon;
        const displayLabel = label ?? config.label;

        return (
            <span
                ref={ref}
                data-slot="status-badge"
                data-status={status}
                className={cn(
                    statusBadgeVariants({ size }),
                    config.badgeClassName,
                    className
                )}
                {...badgeProps}
            >
                {showIcon && (
                    <Icon
                        className={cn("shrink-0", config.iconClassName)}
                        aria-hidden="true"
                    />
                )}
                <span>{displayLabel}</span>
            </span>
        );
    }
);
StatusBadge.displayName = "StatusBadge";

/* -----------------------------------------------------------------------------
 * SelectableStatusBadge Component
 * -------------------------------------------------------------------------- */

export interface SelectableStatusBadgeProps extends Omit<StatusBadgeProps, "status"> {
    /** Current selected status */
    status: StatusType;
    /** Whether the badge is selected */
    selected?: boolean;
    /** Callback when selection changes */
    onSelectedChange?: (selected: boolean) => void;
    /** Available statuses to cycle through when clicked */
    availableStatuses?: StatusType[];
    /** Callback when status changes (if availableStatuses is provided) */
    onStatusChange?: (status: StatusType) => void;
}

/**
 * A selectable/interactive status badge that can toggle selection
 * or cycle through available statuses.
 *
 * @example
 * // Toggle selection
 * <SelectableStatusBadge
 *   status="todo"
 *   selected={isSelected}
 *   onSelectedChange={setIsSelected}
 * />
 *
 * @example
 * // Cycle through statuses
 * <SelectableStatusBadge
 *   status={currentStatus}
 *   availableStatuses={["todo", "in_progress", "done"]}
 *   onStatusChange={setCurrentStatus}
 * />
 */
const SelectableStatusBadge = React.forwardRef<HTMLButtonElement, SelectableStatusBadgeProps>(
    (props, ref) => {
        const {
            status,
            selected,
            onSelectedChange,
            availableStatuses,
            onStatusChange,
            size,
            label,
            icon,
            showIcon = true,
            customConfig,
            className,
            ...badgeProps
        } = props;

        const handleClick = React.useCallback(() => {
            if (availableStatuses && onStatusChange) {
                // Cycle to next status
                const currentIndex = availableStatuses.indexOf(status);
                const nextIndex = (currentIndex + 1) % availableStatuses.length;
                onStatusChange(availableStatuses[nextIndex]!);
            } else if (onSelectedChange !== undefined) {
                // Toggle selection
                onSelectedChange(!selected);
            }
        }, [availableStatuses, onStatusChange, status, onSelectedChange, selected]);

        const config = {
            ...STATUS_CONFIG[status],
            ...customConfig?.[status],
        };

        const Icon = icon ?? config.icon;
        const displayLabel = label ?? config.label;

        return (
            <button
                ref={ref}
                type="button"
                data-slot="selectable-status-badge"
                data-status={status}
                data-selected={selected ?? undefined}
                onClick={handleClick}
                className={cn(
                    statusBadgeVariants({ size }),
                    config.badgeClassName,
                    "cursor-pointer outline-none transition-all",
                    "hover:opacity-80",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    selected && "ring-2 ring-ring ring-offset-1",
                    className
                )}
                {...badgeProps}
            >
                {showIcon && (
                    <Icon
                        className={cn("shrink-0", config.iconClassName)}
                        aria-hidden="true"
                    />
                )}
                <span>{displayLabel}</span>
            </button>
        );
    }
);
SelectableStatusBadge.displayName = "SelectableStatusBadge";

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
    StatusBadge,
    SelectableStatusBadge,
    statusBadgeVariants,
};

export default StatusBadge;

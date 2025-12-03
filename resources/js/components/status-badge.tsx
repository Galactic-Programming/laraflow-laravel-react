import { cva, type VariantProps } from 'class-variance-authority';
import {
    CheckCircleIcon,
    ChevronDownIcon,
    CircleDotIcon,
    CircleIcon,
    type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/* -----------------------------------------------------------------------------
 * Types & Constants
 * -------------------------------------------------------------------------- */

/**
 * Available status types for the StatusBadge component.
 */
export type StatusType = 'active' | 'completed' | 'archived';

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
    active: {
        label: 'Active',
        icon: CircleDotIcon,
        iconClassName: 'text-blue-500 dark:text-blue-400',
        badgeClassName:
            'border-blue-500/30 bg-blue-500/10 dark:border-blue-400/30 dark:bg-blue-400/10',
    },
    completed: {
        label: 'Completed',
        icon: CheckCircleIcon,
        iconClassName: 'text-green-600 dark:text-green-400',
        badgeClassName:
            'border-green-600/30 bg-green-600/10 dark:border-green-400/30 dark:bg-green-400/10',
    },
    archived: {
        label: 'Archived',
        icon: CircleIcon,
        iconClassName: 'text-muted-foreground',
        badgeClassName: 'border-muted-foreground/30 bg-muted/50',
    },
};

/* -----------------------------------------------------------------------------
 * Badge Variants
 * -------------------------------------------------------------------------- */

const statusBadgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            size: {
                sm: 'px-1.5 py-0.5 text-[10px] [&>svg]:size-2.5',
                md: 'px-2 py-0.5 text-xs [&>svg]:size-3',
                lg: 'px-2.5 py-1 text-sm [&>svg]:size-3.5',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

/* -----------------------------------------------------------------------------
 * StatusBadge Component
 * -------------------------------------------------------------------------- */

export interface StatusBadgeProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
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
                    className,
                )}
                {...badgeProps}
            >
                {showIcon && (
                    <Icon
                        className={cn('shrink-0', config.iconClassName)}
                        aria-hidden="true"
                    />
                )}
                <span>{displayLabel}</span>
            </span>
        );
    },
);
StatusBadge.displayName = 'StatusBadge';

/* -----------------------------------------------------------------------------
 * SelectableStatusBadge Component
 * -------------------------------------------------------------------------- */

export interface SelectableStatusBadgeProps
    extends Omit<StatusBadgeProps, 'status'> {
    /** Current selected status */
    status: StatusType;
    /** Available statuses to select from */
    availableStatuses?: StatusType[];
    /** Callback when status changes */
    onStatusChange?: (status: StatusType) => void;
    /** Whether the dropdown is disabled */
    disabled?: boolean;
    /** Show chevron indicator */
    showChevron?: boolean;
}

/**
 * An interactive status badge with dropdown menu for changing status.
 *
 * @example
 * // Basic usage with all statuses
 * <SelectableStatusBadge
 *   status={currentStatus}
 *   onStatusChange={setCurrentStatus}
 * />
 *
 * @example
 * // With specific statuses
 * <SelectableStatusBadge
 *   status={currentStatus}
 *   availableStatuses={["todo", "in_progress", "done"]}
 *   onStatusChange={setCurrentStatus}
 * />
 */
const SelectableStatusBadge = React.forwardRef<
    HTMLButtonElement,
    SelectableStatusBadgeProps
>((props, ref) => {
    const {
        status,
        availableStatuses = Object.keys(STATUS_CONFIG) as StatusType[],
        onStatusChange,
        size,
        label,
        icon,
        showIcon = true,
        showChevron = true,
        customConfig,
        disabled = false,
        className,
        ...badgeProps
    } = props;

    const config = {
        ...STATUS_CONFIG[status],
        ...customConfig?.[status],
    };

    const Icon = icon ?? config.icon;
    const displayLabel = label ?? config.label;

    const handleStatusSelect = React.useCallback(
        (newStatus: StatusType) => {
            if (onStatusChange && newStatus !== status) {
                onStatusChange(newStatus);
            }
        },
        [onStatusChange, status],
    );

    if (disabled || !onStatusChange) {
        // Render as non-interactive badge when disabled
        return (
            <span
                data-slot="selectable-status-badge"
                data-status={status}
                className={cn(
                    statusBadgeVariants({ size }),
                    config.badgeClassName,
                    disabled && 'cursor-not-allowed opacity-50',
                    className,
                )}
                {...badgeProps}
            >
                {showIcon && (
                    <Icon
                        className={cn('shrink-0', config.iconClassName)}
                        aria-hidden="true"
                    />
                )}
                <span>{displayLabel}</span>
            </span>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    ref={ref}
                    type="button"
                    data-slot="selectable-status-badge"
                    data-status={status}
                    className={cn(
                        statusBadgeVariants({ size }),
                        config.badgeClassName,
                        'cursor-pointer transition-all outline-none',
                        'hover:opacity-80',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                        className,
                    )}
                    {...badgeProps}
                >
                    {showIcon && (
                        <Icon
                            className={cn('shrink-0', config.iconClassName)}
                            aria-hidden="true"
                        />
                    )}
                    <span>{displayLabel}</span>
                    {showChevron && (
                        <ChevronDownIcon
                            className="size-3 shrink-0 opacity-50"
                            aria-hidden="true"
                        />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
                {availableStatuses.map((statusOption) => {
                    const optionConfig = {
                        ...STATUS_CONFIG[statusOption],
                        ...customConfig?.[statusOption],
                    };
                    const OptionIcon = optionConfig.icon;

                    return (
                        <DropdownMenuItem
                            key={statusOption}
                            onClick={() => handleStatusSelect(statusOption)}
                            className={cn(
                                'gap-2',
                                status === statusOption && 'bg-accent',
                            )}
                        >
                            <OptionIcon
                                className={cn(
                                    'size-4 shrink-0',
                                    optionConfig.iconClassName,
                                )}
                                aria-hidden="true"
                            />
                            <span>{optionConfig.label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});
SelectableStatusBadge.displayName = 'SelectableStatusBadge';

/* -----------------------------------------------------------------------------
 * StatusSelect Component (Alternative with more control)
 * -------------------------------------------------------------------------- */

export interface StatusSelectProps {
    /** Current selected status */
    value: StatusType;
    /** Callback when status changes */
    onValueChange: (status: StatusType) => void;
    /** Available statuses to select from */
    options?: StatusType[];
    /** Placeholder text when no status selected */
    placeholder?: string;
    /** Whether the select is disabled */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show icons */
    showIcon?: boolean;
    /** Custom status configuration */
    customConfig?: Partial<Record<StatusType, Partial<StatusConfig>>>;
    /** Additional className */
    className?: string;
}

/**
 * A status select component with dropdown menu for changing status.
 * More controlled alternative to SelectableStatusBadge.
 *
 * @example
 * <StatusSelect
 *   value={status}
 *   onValueChange={setStatus}
 *   options={["todo", "in_progress", "done"]}
 * />
 */
function StatusSelect({
    value,
    onValueChange,
    options = Object.keys(STATUS_CONFIG) as StatusType[],
    placeholder = 'Select status',
    disabled = false,
    size = 'md',
    showIcon = true,
    customConfig,
    className,
}: StatusSelectProps) {
    const config = value
        ? { ...STATUS_CONFIG[value], ...customConfig?.[value] }
        : null;

    const Icon = config?.icon;
    const displayLabel = config?.label ?? placeholder;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    data-slot="status-select"
                    data-status={value}
                    disabled={disabled}
                    className={cn(
                        statusBadgeVariants({ size }),
                        config?.badgeClassName ?? 'border-border bg-background',
                        'cursor-pointer transition-all outline-none',
                        'hover:opacity-80',
                        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                        disabled && 'cursor-not-allowed opacity-50',
                        className,
                    )}
                >
                    {showIcon && Icon && (
                        <Icon
                            className={cn('shrink-0', config?.iconClassName)}
                            aria-hidden="true"
                        />
                    )}
                    <span>{displayLabel}</span>
                    <ChevronDownIcon
                        className="size-3 shrink-0 opacity-50"
                        aria-hidden="true"
                    />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
                {options.map((statusOption) => {
                    const optionConfig = {
                        ...STATUS_CONFIG[statusOption],
                        ...customConfig?.[statusOption],
                    };
                    const OptionIcon = optionConfig.icon;

                    return (
                        <DropdownMenuItem
                            key={statusOption}
                            onClick={() => onValueChange(statusOption)}
                            className={cn(
                                'gap-2',
                                value === statusOption && 'bg-accent',
                            )}
                        >
                            <OptionIcon
                                className={cn(
                                    'size-4 shrink-0',
                                    optionConfig.iconClassName,
                                )}
                                aria-hidden="true"
                            />
                            <span>{optionConfig.label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* -----------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
    SelectableStatusBadge,
    StatusBadge,
    statusBadgeVariants,
    StatusSelect,
};

export default StatusBadge;

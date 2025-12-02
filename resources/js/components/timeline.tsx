import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2Icon, CalendarIcon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface TimelineItem {
    /** Main title of the timeline item */
    title: string;
    /** Subtitle or company name */
    subtitle?: string;
    /** Time period or date */
    period?: string;
    /** Description text */
    description?: string;
    /** Array of tags/badges to display */
    tags?: string[];
    /** Custom icon for this item */
    icon?: LucideIcon;
    /** Custom content to render instead of default layout */
    children?: React.ReactNode;
}

export interface TimelineProps {
    /** Array of timeline items */
    items: TimelineItem[];
    /** Default icon for all items (can be overridden per item) */
    defaultIcon?: LucideIcon;
    /** Show subtitle with icon */
    showSubtitleIcon?: boolean;
    /** Show period with calendar icon */
    showPeriodIcon?: boolean;
    /** Badge variant for tags */
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
    /** Additional class name for the container */
    className?: string;
    /** Additional class name for each item */
    itemClassName?: string;
}

// ============================================================================
// Timeline Component
// ============================================================================

export function Timeline({
    items,
    defaultIcon: DefaultIcon = Building2Icon,
    showSubtitleIcon = true,
    showPeriodIcon = true,
    badgeVariant = 'secondary',
    className,
    itemClassName,
}: TimelineProps) {
    return (
        <div className={cn('relative ml-3', className)}>
            {/* Timeline line */}
            <div className="absolute bottom-0 left-0 top-4 border-l-2" />

            {items.map((item, index) => {
                const ItemIcon = item.icon || DefaultIcon;

                return (
                    <div
                        key={index}
                        className={cn('relative pb-12 pl-8 last:pb-0', itemClassName)}
                    >
                        {/* Timeline dot */}
                        <div className="border-primary bg-background absolute left-px top-3 h-3 w-3 -translate-x-1/2 rounded-full border-2" />

                        {/* Content */}
                        {item.children ? (
                            item.children
                        ) : (
                            <div className="space-y-3">
                                {/* Subtitle with icon */}
                                {item.subtitle && (
                                    <div className="flex items-center gap-2.5">
                                        {showSubtitleIcon && (
                                            <div className="bg-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                                                <ItemIcon className="text-muted-foreground h-5 w-5" />
                                            </div>
                                        )}
                                        <span className="text-base font-medium">{item.subtitle}</span>
                                    </div>
                                )}

                                {/* Title and period */}
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.01em]">
                                        {item.title}
                                    </h3>
                                    {item.period && (
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            {showPeriodIcon && <CalendarIcon className="h-4 w-4" />}
                                            <span>{item.period}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {item.description && (
                                    <p className="text-muted-foreground text-pretty text-sm sm:text-base">
                                        {item.description}
                                    </p>
                                )}

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {item.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant={badgeVariant}
                                                className="rounded-full"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ============================================================================
// Timeline Item Component (for custom rendering)
// ============================================================================

export interface TimelineItemComponentProps {
    children: React.ReactNode;
    className?: string;
}

export function TimelineItemContent({ children, className }: TimelineItemComponentProps) {
    return <div className={cn('space-y-3', className)}>{children}</div>;
}

// ============================================================================
// Wrapper Component with Container Styling
// ============================================================================

export interface TimelineContainerProps extends TimelineProps {
    /** Container max width */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Container padding */
    containerClassName?: string;
}

export function TimelineContainer({
    maxWidth = 'sm',
    containerClassName,
    ...props
}: TimelineContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-(--breakpoint-sm)',
        md: 'max-w-(--breakpoint-md)',
        lg: 'max-w-(--breakpoint-lg)',
        xl: 'max-w-(--breakpoint-xl)',
        full: 'max-w-full',
    };

    return (
        <div
            className={cn(
                'mx-auto px-6 py-12 md:py-20',
                maxWidthClasses[maxWidth],
                containerClassName
            )}
        >
            <Timeline {...props} />
        </div>
    );
}

// ============================================================================
// Example Data (for reference)
// ============================================================================

export const exampleTimelineItems: TimelineItem[] = [
    {
        title: 'Senior Full Stack Developer',
        subtitle: 'TechCorp Solutions',
        period: '2023 - Present',
        description:
            'Led the development of enterprise-scale web applications, mentored junior developers, and implemented best practices for code quality and performance optimization.',
        tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    },
    {
        title: 'Full Stack Developer',
        subtitle: 'Digital Innovations Inc',
        period: '2021 - 2023',
        description:
            'Developed and maintained multiple client projects, implemented responsive designs, and integrated third-party APIs for enhanced functionality.',
        tags: ['React', 'Express.js', 'PostgreSQL', 'Docker', 'Redis'],
    },
    {
        title: 'Frontend Developer',
        subtitle: 'WebTech Studios',
        period: '2018 - 2021',
        description:
            'Created responsive and interactive user interfaces, collaborated with designers, and optimized application performance.',
        tags: ['React', 'JavaScript', 'SASS', 'Webpack', 'Jest'],
    },
];

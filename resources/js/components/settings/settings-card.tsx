import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export interface SettingsCardProps {
    /** Card title */
    title?: string;
    /** Card description */
    description?: string;
    /** Card content */
    children: ReactNode;
    /** Whether this is a danger/destructive card */
    danger?: boolean;
    /** Additional className for the card */
    className?: string;
    /** Whether to show header (requires title) */
    showHeader?: boolean;
    /** Actions to show in header (right side) */
    headerActions?: ReactNode;
    /** Custom content padding */
    contentClassName?: string;
}

export function SettingsCard({
    title,
    description,
    children,
    danger = false,
    className,
    showHeader = true,
    headerActions,
    contentClassName,
}: SettingsCardProps) {
    const hasHeader = showHeader && (title || description);

    return (
        <Card
            className={cn(
                danger && 'border-destructive/50',
                className,
            )}
        >
            {hasHeader && (
                <CardHeader className={cn(headerActions && 'flex flex-row items-center justify-between')}>
                    <div>
                        {title && (
                            <CardTitle className={cn(danger && 'text-destructive')}>
                                {title}
                            </CardTitle>
                        )}
                        {description && (
                            <CardDescription>{description}</CardDescription>
                        )}
                    </div>
                    {headerActions}
                </CardHeader>
            )}
            <CardContent className={cn(!hasHeader && 'pt-6', contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
}

export default SettingsCard;

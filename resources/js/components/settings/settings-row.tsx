import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export interface SettingsRowProps {
    /** Row title/label */
    title: string;
    /** Row description */
    description?: string;
    /** Action element (Button, Switch, Badge, etc.) */
    action?: ReactNode;
    /** Icon to show before title */
    icon?: ReactNode;
    /** Additional className */
    className?: string;
    /** Whether to use flex-col on mobile */
    stackOnMobile?: boolean;
}

export function SettingsRow({
    title,
    description,
    action,
    icon,
    className,
    stackOnMobile = false,
}: SettingsRowProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4',
                stackOnMobile &&
                    'flex-col items-start sm:flex-row sm:items-center',
                className,
            )}
        >
            <div className="flex items-start gap-3">
                {icon && <div className="mt-0.5 flex-shrink-0">{icon}</div>}
                <div className="space-y-1">
                    <Label className="text-base font-medium">{title}</Label>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div
                    className={cn(
                        'flex-shrink-0',
                        stackOnMobile && 'w-full sm:w-auto',
                    )}
                >
                    {action}
                </div>
            )}
        </div>
    );
}

export default SettingsRow;

import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';

export interface DangerZoneProps {
    /** Warning title */
    title?: string;
    /** Warning description */
    description?: string;
    /** Content/actions inside the danger zone */
    children: ReactNode;
    /** Additional className */
    className?: string;
    /** Whether to show the warning icon */
    showIcon?: boolean;
}

export function DangerZone({
    title = 'Warning',
    description = 'Please proceed with caution, this cannot be undone.',
    children,
    className,
    showIcon = true,
}: DangerZoneProps) {
    return (
        <div
            className={cn(
                'space-y-4 rounded-lg border border-red-100 bg-red-50 p-4',
                'dark:border-red-200/10 dark:bg-red-700/10',
                className,
            )}
        >
            <div className="flex items-start gap-3 text-red-600 dark:text-red-100">
                {showIcon && (
                    <AlertTriangle className="mt-0.5 size-5 flex-shrink-0" />
                )}
                <div className="space-y-0.5">
                    {title && <p className="font-medium">{title}</p>}
                    {description && <p className="text-sm">{description}</p>}
                </div>
            </div>
            <div>{children}</div>
        </div>
    );
}

export default DangerZone;

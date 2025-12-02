import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertErrorProps {
    /** Array of error messages to display */
    errors: string[];
    /** Custom title (default: "Something went wrong.") */
    title?: string;
    /** Custom icon */
    icon?: LucideIcon;
    /** Additional class name */
    className?: string;
}

export function AlertError({
    errors,
    title = 'Something went wrong.',
    icon: Icon = AlertCircleIcon,
    className,
}: AlertErrorProps) {
    if (errors.length === 0) return null;

    // Remove duplicates
    const uniqueErrors = Array.from(new Set(errors));

    return (
        <Alert variant="destructive" className={cn(className)}>
            <Icon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {uniqueErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}

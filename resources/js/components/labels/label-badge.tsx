import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type Label } from '@/types/task';

interface LabelBadgeProps {
    label: Label;
    className?: string;
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn('text-xs font-medium', className)}
            style={{
                borderColor: label.color,
                color: label.color,
                backgroundColor: `${label.color}10`,
            }}
        >
            {label.name}
        </Badge>
    );
}

interface LabelListProps {
    labels: Label[];
    maxVisible?: number;
    className?: string;
}

export function LabelList({
    labels,
    maxVisible = 3,
    className,
}: LabelListProps) {
    if (!labels || labels.length === 0) {
        return null;
    }

    const visibleLabels = labels.slice(0, maxVisible);
    const remainingCount = labels.length - maxVisible;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {visibleLabels.map((label) => (
                <LabelBadge key={label.id} label={label} />
            ))}
            {remainingCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                    +{remainingCount}
                </Badge>
            )}
        </div>
    );
}

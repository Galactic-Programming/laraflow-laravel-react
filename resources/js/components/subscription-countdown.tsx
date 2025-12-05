import { AlertTriangleIcon, ClockIcon } from 'lucide-react';

import { formatCountdown, useCountdown } from '@/hooks/use-countdown';
import { cn } from '@/lib/utils';

import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface SubscriptionCountdownProps {
    /** Timestamp khi subscription hết hạn (Unix timestamp in seconds) */
    endsAt: number | null;
    /** Timestamp khi subscription bắt đầu (Unix timestamp in seconds) */
    startsAt?: number | null;
    /** Ngày hết hạn hiển thị dạng text */
    endsAtFormatted?: string | null;
    /** Ngày bắt đầu hiển thị dạng text */
    startsAtFormatted?: string | null;
    /** Hiển thị dạng compact (chỉ countdown) */
    compact?: boolean;
    /** Hiển thị progress bar */
    showProgress?: boolean;
    /** Hiển thị chi tiết giây */
    showSeconds?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * Component hiển thị đếm ngược thời gian còn lại của subscription.
 *
 * @example
 * ```tsx
 * <SubscriptionCountdown
 *   endsAt={subscription.ends_at_timestamp}
 *   startsAt={subscription.starts_at_timestamp}
 *   endsAtFormatted={subscription.ends_at}
 *   startsAtFormatted={subscription.starts_at}
 * />
 * ```
 */
export function SubscriptionCountdown({
    endsAt,
    startsAt,
    endsAtFormatted,
    startsAtFormatted,
    compact = false,
    showProgress = true,
    showSeconds = false,
    className,
}: SubscriptionCountdownProps) {
    const countdown = useCountdown({
        endsAt,
        startsAt,
        expiringSoonDays: 7,
    });

    if (endsAt === null) {
        return null;
    }

    if (countdown.isExpired) {
        return (
            <div className={cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className)}>
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Subscription has expired</span>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    {formatCountdown(countdown, { showSeconds })} remaining
                </span>
                {countdown.isExpiringSoon && (
                    <Badge variant="destructive" className="text-xs">
                        Expiring soon
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'rounded-lg border p-4',
                countdown.isExpiringSoon ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-muted/30',
                className,
            )}
        >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time Remaining</span>
                </div>
                {countdown.isExpiringSoon && (
                    <Badge variant="destructive" className="text-xs">
                        <AlertTriangleIcon className="mr-1 h-3 w-3" />
                        Expiring soon
                    </Badge>
                )}
            </div>

            {/* Countdown boxes */}
            <div className="mb-4 grid grid-cols-4 gap-2">
                <CountdownBox value={countdown.days} label="Days" highlight={countdown.days <= 3} />
                <CountdownBox value={countdown.hours} label="Hours" />
                <CountdownBox value={countdown.minutes} label="Minutes" />
                {showSeconds || countdown.days === 0 ? (
                    <CountdownBox value={countdown.seconds} label="Seconds" />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-md bg-background/50 p-2">
                        <span className="text-2xl font-bold tabular-nums">--</span>
                        <span className="text-xs text-muted-foreground">Seconds</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {showProgress && (
                <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(countdown.progressPercentage)}% used</span>
                        <span>{Math.round(countdown.remainingPercentage)}% remaining</span>
                    </div>
                    <Progress
                        value={countdown.progressPercentage}
                        className={cn('h-2', countdown.isExpiringSoon && '[&>div]:bg-amber-500')}
                    />
                </div>
            )}

            {/* Date range */}
            {(startsAtFormatted || endsAtFormatted) && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {startsAtFormatted && <span>Started: {startsAtFormatted}</span>}
                    {endsAtFormatted && <span>Expires: {endsAtFormatted}</span>}
                </div>
            )}
        </div>
    );
}

interface CountdownBoxProps {
    value: number;
    label: string;
    highlight?: boolean;
}

function CountdownBox({ value, label, highlight = false }: CountdownBoxProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-md p-2',
                highlight ? 'bg-destructive/10 text-destructive' : 'bg-background/50',
            )}
        >
            <span className={cn('text-2xl font-bold tabular-nums', highlight && 'animate-pulse')}>
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

/**
 * Compact inline countdown display.
 */
export function InlineCountdown({
    endsAt,
    startsAt,
    className,
}: {
    endsAt: number | null;
    startsAt?: number | null;
    className?: string;
}) {
    const countdown = useCountdown({
        endsAt,
        startsAt,
        expiringSoonDays: 7,
    });

    if (endsAt === null || countdown.isExpired) {
        return null;
    }

    return (
        <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
            <ClockIcon className="h-3.5 w-3.5" />
            <span className="tabular-nums">{formatCountdown(countdown)}</span>
            {countdown.isExpiringSoon && (
                <Badge variant="destructive" className="ml-1 px-1 py-0 text-[10px]">
                    Soon
                </Badge>
            )}
        </span>
    );
}

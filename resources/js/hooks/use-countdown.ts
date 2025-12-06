import { useCallback, useEffect, useMemo, useState } from 'react';

interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
    progressPercentage: number;
    remainingPercentage: number;
}

interface UseCountdownOptions {
    /** Timestamp khi subscription hết hạn (Unix timestamp in seconds) */
    endsAt: number | null;
    /** Timestamp khi subscription bắt đầu (Unix timestamp in seconds) */
    startsAt?: number | null;
    /** Số ngày được coi là "sắp hết hạn" */
    expiringSoonDays?: number;
    /** Interval cập nhật (ms). Default: 1000ms cho < 1 ngày, 60000ms cho >= 1 ngày */
    updateInterval?: number;
    /** Callback khi hết hạn */
    onExpire?: () => void;
}

function calculateTimeRemaining(
    endsAt: number | null,
    startsAt: number | null | undefined,
    expiringSoonDays: number,
): CountdownTime {
    if (endsAt === null) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isExpired: false,
            isExpiringSoon: false,
            progressPercentage: 0,
            remainingPercentage: 100,
        };
    }

    const now = Math.floor(Date.now() / 1000);
    const difference = endsAt - now;

    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isExpired: true,
            isExpiringSoon: false,
            progressPercentage: 100,
            remainingPercentage: 0,
        };
    }

    const days = Math.floor(difference / 86400);
    const hours = Math.floor((difference % 86400) / 3600);
    const minutes = Math.floor((difference % 3600) / 60);
    const seconds = difference % 60;

    // Calculate progress percentage
    let progressPercentage = 0;
    let remainingPercentage = 100;

    if (startsAt !== null && startsAt !== undefined) {
        const totalDuration = endsAt - startsAt;
        const elapsed = now - startsAt;

        if (totalDuration > 0) {
            progressPercentage = Math.min(
                100,
                Math.max(0, (elapsed / totalDuration) * 100),
            );
            remainingPercentage = 100 - progressPercentage;
        }
    }

    const isExpiringSoon = days <= expiringSoonDays;

    return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: difference,
        isExpired: false,
        isExpiringSoon,
        progressPercentage: Math.round(progressPercentage * 100) / 100,
        remainingPercentage: Math.round(remainingPercentage * 100) / 100,
    };
}

/**
 * Hook đếm ngược thời gian còn lại của subscription.
 *
 * @example
 * ```tsx
 * const { days, hours, minutes, seconds, isExpired, isExpiringSoon } = useCountdown({
 *   endsAt: subscription.ends_at_timestamp,
 *   startsAt: subscription.starts_at_timestamp,
 * });
 * ```
 */
export function useCountdown({
    endsAt,
    startsAt,
    expiringSoonDays = 7,
    updateInterval,
    onExpire,
}: UseCountdownOptions): CountdownTime {
    // Memoize initial calculation
    const initialTime = useMemo(
        () => calculateTimeRemaining(endsAt, startsAt, expiringSoonDays),
        [endsAt, startsAt, expiringSoonDays],
    );

    const [timeLeft, setTimeLeft] = useState<CountdownTime>(initialTime);

    // Sync state when props change
    const timeLeftKey = `${endsAt}-${startsAt}`;
    const [prevKey, setPrevKey] = useState(timeLeftKey);

    if (timeLeftKey !== prevKey) {
        setPrevKey(timeLeftKey);
        setTimeLeft(initialTime);
    }

    const calculateTimeLeft = useCallback(
        () => calculateTimeRemaining(endsAt, startsAt, expiringSoonDays),
        [endsAt, startsAt, expiringSoonDays],
    );

    useEffect(() => {
        if (timeLeft.isExpired) {
            onExpire?.();
            return;
        }

        // Determine update interval based on time remaining for optimal performance
        // - < 1 hour: every second (real-time countdown)
        // - 1-24 hours: every 30 seconds
        // - 1-7 days: every minute
        // - > 7 days: every 5 minutes
        const getOptimalInterval = (time: CountdownTime): number => {
            if (updateInterval !== undefined) return updateInterval;

            const { days, totalSeconds } = time;

            if (totalSeconds <= 3600) {
                // < 1 hour: update every second
                return 1000;
            } else if (days < 1) {
                // 1-24 hours: update every 30 seconds
                return 30000;
            } else if (days <= 7) {
                // 1-7 days: update every minute
                return 60000;
            } else {
                // > 7 days: update every 5 minutes
                return 300000;
            }
        };

        const interval = getOptimalInterval(timeLeft);

        const timer = setInterval(() => {
            const updated = calculateTimeLeft();
            setTimeLeft(updated);

            if (updated.isExpired) {
                onExpire?.();
                clearInterval(timer);
            }
        }, interval);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        calculateTimeLeft,
        updateInterval,
        onExpire,
        timeLeft.isExpired,
        timeLeft.days,
        timeLeft.totalSeconds,
    ]);

    return timeLeft;
}

/**
 * Format countdown time to human-readable string.
 */
export function formatCountdown(
    time: CountdownTime,
    options?: { showSeconds?: boolean },
): string {
    const { days, hours, minutes, seconds, isExpired } = time;
    const { showSeconds = false } = options ?? {};

    if (isExpired) {
        return 'Expired';
    }

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }
    if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
    }
    if (minutes > 0 || hours > 0 || days > 0) {
        parts.push(`${minutes}m`);
    }
    if (showSeconds || (days === 0 && hours === 0)) {
        parts.push(`${seconds}s`);
    }

    return parts.join(' ') || '0s';
}

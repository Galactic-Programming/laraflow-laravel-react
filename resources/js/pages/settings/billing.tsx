import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangleIcon,
    CheckCircleIcon,
    CreditCardIcon,
    ExternalLinkIcon,
    InfoIcon,
    ReceiptIcon,
    RefreshCwIcon,
    XCircleIcon,
} from 'lucide-react';

import { SettingsCard } from '@/components/settings';
import { SubscriptionCountdown } from '@/components/subscription-countdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface Subscription {
    id: number;
    plan: string | null;
    plan_slug: string | null;
    billing_interval: string | null;
    price: number | null;
    status: string;
    status_label: string;
    status_badge_variant: 'default' | 'secondary' | 'destructive' | 'outline';
    starts_at: string | null;
    starts_at_timestamp: number | null;
    ends_at: string | null;
    ends_at_timestamp: number | null;
    cancelled_at: string | null;
    // Countdown data
    remaining_time: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total_seconds: number;
        is_expired: boolean;
    } | null;
    days_until_expiry: number;
    is_expiring_soon: boolean;
    progress_percentage: number;
    remaining_percentage: number;
    total_duration_days: number;
    // Auto-renewal
    auto_renew: boolean;
    can_purchase_new: boolean;
    // Status checks
    is_active: boolean;
    is_cancelled: boolean;
    is_cancelled_but_active: boolean;
    has_access: boolean;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    status_label: string;
    type: string;
    type_label: string;
    plan: string | null;
    paid_at: string | null;
    invoice_number: string | null;
}

interface Props {
    subscription: Subscription | null;
    payments: Payment[];
    customerPortalUrl: string | null;
    paymentSuccess?: boolean;
    stripePaymentLinks: {
        professional_monthly: string | null;
        professional_yearly: string | null;
    };
}

export default function Billing({
    subscription,
    payments,
    customerPortalUrl,
    paymentSuccess,
    stripePaymentLinks,
}: Props) {
    const { t } = useTranslations();
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.billing', 'Billing'),
            href: '/settings/billing',
        },
    ];

    const getStatusBadge = (
        status: string,
        variant?: 'default' | 'secondary' | 'destructive' | 'outline',
        label?: string,
    ) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
            active: 'default',
            cancelled: 'secondary',
            expired: 'destructive',
            past_due: 'destructive',
            completed: 'default',
            pending: 'secondary',
            failed: 'destructive',
        };

        const labels: Record<string, string> = {
            active: t('billing.status_active', 'Active'),
            cancelled: t('billing.status_cancelled', 'Cancelled'),
            expired: t('billing.status_expired', 'Expired'),
            past_due: t('billing.status_past_due', 'Past Due'),
            completed: t('billing.status_completed', 'Completed'),
            pending: t('billing.status_pending', 'Pending'),
            failed: t('billing.status_failed', 'Failed'),
        };

        return (
            <Badge variant={variant || variants[status] || 'outline'}>
                {label || labels[status] || status}
            </Badge>
        );
    };

    const handleCancelSubscription = () => {
        router.post(
            '/settings/billing/cancel',
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleResumeSubscription = () => {
        router.post(
            '/settings/billing/resume',
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleToggleAutoRenew = () => {
        router.post(
            '/settings/billing/auto-renew',
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const getUpgradeUrl = (paymentLink: string | null) => {
        if (!paymentLink || !auth.user) return null;
        const url = new URL(paymentLink);
        url.searchParams.set('client_reference_id', String(auth.user.id));
        return url.toString();
    };

    const handleUpgrade = (paymentLink: string | null) => {
        const url = getUpgradeUrl(paymentLink);
        if (url) {
            window.location.href = url;
        }
    };

    const isCancelled = subscription?.is_cancelled;
    const canResume = subscription?.is_cancelled_but_active;
    const hasAccess = subscription?.has_access;
    const canPurchaseNew = subscription?.can_purchase_new ?? true;

    return (
        <AppLayout breadcrumbs={breadcrumbs} showBackground={false}>
            <Head title={t('settings.billing', 'Billing')} />

            <SettingsLayout>
                {/* Success Alert */}
                {paymentSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            {t(
                                'billing.payment_success',
                                'Payment successful! Your subscription is now active.',
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Current Subscription */}
                <SettingsCard
                    title={t('billing.subscription', 'Subscription')}
                    description={t(
                        'billing.subscription_desc',
                        'Manage your subscription plan',
                    )}
                >
                    <div className="space-y-4">
                        {subscription && hasAccess ? (
                            <Card>
                                <CardHeader className="pb-1">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {subscription.plan ||
                                                t(
                                                    'billing.unknown_plan',
                                                    'Unknown Plan',
                                                )}
                                            {subscription.billing_interval && (
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    (
                                                    {subscription.billing_interval ===
                                                    'year'
                                                        ? t(
                                                              'billing.yearly',
                                                              'Yearly',
                                                          )
                                                        : t(
                                                              'billing.monthly',
                                                              'Monthly',
                                                          )}
                                                    )
                                                </span>
                                            )}
                                        </CardTitle>
                                        {getStatusBadge(
                                            subscription.status,
                                            subscription.status_badge_variant,
                                            subscription.status_label,
                                        )}
                                    </div>
                                    {subscription.price !== null && (
                                        <div className="text-2xl font-bold">
                                            ${subscription.price}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /
                                                {subscription.billing_interval ===
                                                'year'
                                                    ? t('billing.year', 'year')
                                                    : t(
                                                          'billing.month',
                                                          'month',
                                                      )}
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Countdown Timer */}
                                    {subscription.starts_at_timestamp &&
                                        subscription.ends_at_timestamp && (
                                            <SubscriptionCountdown
                                                startsAt={
                                                    subscription.starts_at_timestamp
                                                }
                                                endsAt={
                                                    subscription.ends_at_timestamp
                                                }
                                                startsAtFormatted={
                                                    subscription.starts_at
                                                }
                                                endsAtFormatted={
                                                    subscription.ends_at
                                                }
                                            />
                                        )}

                                    {/* Subscription Dates */}
                                    <div className="grid gap-2 text-sm">
                                        {subscription.cancelled_at && (
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <AlertTriangleIcon className="h-4 w-4" />
                                                <span>
                                                    {t(
                                                        'billing.cancelled_on',
                                                        'Cancelled on',
                                                    )}
                                                    :{' '}
                                                    {subscription.cancelled_at}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cancelled But Still Has Access Alert */}
                                    {canResume && (
                                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                                            <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                                            <AlertDescription className="text-amber-700 dark:text-amber-300">
                                                {t(
                                                    'billing.cancelled_still_access',
                                                    'Your subscription has been cancelled, but you still have access to Professional features until',
                                                )}{' '}
                                                <strong>
                                                    {subscription.ends_at}
                                                </strong>
                                                .{' '}
                                                {t(
                                                    'billing.cancelled_resume_hint',
                                                    'You can resume your subscription anytime before it expires.',
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Auto-Renew Toggle */}
                                    {subscription.is_active && !isCancelled && (
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-2">
                                                <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {t(
                                                            'billing.auto_renew',
                                                            'Auto-renewal',
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {subscription.auto_renew
                                                            ? t(
                                                                  'billing.auto_renew_enabled_desc',
                                                                  'Your subscription will automatically renew',
                                                              )
                                                            : t(
                                                                  'billing.auto_renew_disabled_desc',
                                                                  'Your subscription will expire at the end of period',
                                                              )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={
                                                    subscription.auto_renew
                                                }
                                                onCheckedChange={
                                                    handleToggleAutoRenew
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Cannot Purchase Warning */}
                                    {!canPurchaseNew && (
                                        <Alert>
                                            <InfoIcon className="h-4 w-4" />
                                            <AlertDescription>
                                                {t(
                                                    'billing.cannot_purchase_new',
                                                    'You cannot purchase a new subscription while your current one is active. Wait until it expires or contact support.',
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {customerPortalUrl && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <a
                                                    href={customerPortalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                                    {t(
                                                        'billing.manage_payment',
                                                        'Manage Payment',
                                                    )}
                                                    <ExternalLinkIcon className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}

                                        {/* Switch Plan (Monthly ↔ Yearly) - Only if can purchase new */}
                                        {subscription.is_active &&
                                            !isCancelled &&
                                            subscription.billing_interval ===
                                                'month' &&
                                            stripePaymentLinks.professional_yearly &&
                                            canPurchaseNew && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleUpgrade(
                                                                        stripePaymentLinks.professional_yearly,
                                                                    )
                                                                }
                                                            >
                                                                {t(
                                                                    'billing.switch_yearly',
                                                                    'Switch to Yearly (Save 17%)',
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                {t(
                                                                    'billing.switch_yearly_tooltip',
                                                                    'Upgrade to yearly billing and save 17%',
                                                                )}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                        {/* Resume or Cancel */}
                                        {canResume ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={
                                                    handleResumeSubscription
                                                }
                                            >
                                                {t(
                                                    'billing.resume',
                                                    'Resume Subscription',
                                                )}
                                            </Button>
                                        ) : subscription.is_active ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <XCircleIcon className="mr-2 h-4 w-4" />
                                                        {t(
                                                            'billing.cancel',
                                                            'Cancel Subscription',
                                                        )}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {t(
                                                                'billing.cancel_title',
                                                                'Cancel Subscription?',
                                                            )}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t(
                                                                'billing.cancel_desc',
                                                                'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.',
                                                            )}
                                                            {subscription.ends_at && (
                                                                <span className="mt-2 block font-medium">
                                                                    {t(
                                                                        'billing.access_until',
                                                                        'Access until',
                                                                    )}
                                                                    :{' '}
                                                                    {
                                                                        subscription.ends_at
                                                                    }
                                                                </span>
                                                            )}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">
                                                                {t(
                                                                    'common.nevermind',
                                                                    'Nevermind',
                                                                )}
                                                            </Button>
                                                        </DialogClose>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={
                                                                handleCancelSubscription
                                                            }
                                                        >
                                                            {t(
                                                                'billing.confirm_cancel',
                                                                'Yes, Cancel',
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        ) : null}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {t('billing.free_plan', 'Free Plan')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t(
                                            'billing.free_plan_desc',
                                            "You're currently on the free Starter plan.",
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/pricing">
                                            {t(
                                                'billing.upgrade',
                                                'Upgrade to Professional',
                                            )}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </SettingsCard>

                {/* Payment History */}
                <SettingsCard
                    title={t('billing.payment_history', 'Payment History')}
                    description={t(
                        'billing.payment_history_desc',
                        'View your recent payments',
                    )}
                >
                    {payments.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            {t('billing.date', 'Date')}
                                        </TableHead>
                                        <TableHead>
                                            {t('billing.plan', 'Plan')}
                                        </TableHead>
                                        <TableHead>
                                            {t('billing.amount', 'Amount')}
                                        </TableHead>
                                        <TableHead>
                                            {t('billing.status', 'Status')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.paid_at || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {payment.plan || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {payment.currency}{' '}
                                                {Number(payment.amount).toFixed(
                                                    2,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(payment.status)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ReceiptIcon className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t(
                                    'billing.no_payments',
                                    'No payment history yet',
                                )}
                            </p>
                        </div>
                    )}
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

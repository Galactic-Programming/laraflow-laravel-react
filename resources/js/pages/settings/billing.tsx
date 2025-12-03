import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangleIcon, CalendarIcon, CheckCircleIcon, CreditCardIcon, ExternalLinkIcon, ReceiptIcon, XCircleIcon } from 'lucide-react';

import { SettingsCard } from '@/components/settings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    starts_at: string | null;
    ends_at: string | null;
    ends_at_timestamp: number | null;
    cancelled_at: string | null;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    plan: string | null;
    paid_at: string | null;
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

export default function Billing({ subscription, payments, customerPortalUrl, paymentSuccess, stripePaymentLinks }: Props) {
    const { t } = useTranslations();
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.billing', 'Billing'),
            href: '/settings/billing',
        },
    ];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
            <Badge variant={variants[status] || 'outline'}>
                {labels[status] || status}
            </Badge>
        );
    };

    const handleCancelSubscription = () => {
        router.post('/settings/billing/cancel', {}, {
            preserveScroll: true,
        });
    };

    const handleResumeSubscription = () => {
        router.post('/settings/billing/resume', {}, {
            preserveScroll: true,
        });
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

    const isCancelled = subscription?.status === 'cancelled';
    const canResume = isCancelled && subscription?.ends_at_timestamp && subscription.ends_at_timestamp > Date.now() / 1000;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.billing', 'Billing')} />

            <SettingsLayout>
                {/* Success Alert */}
                {paymentSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            {t('billing.payment_success', 'Payment successful! Your subscription is now active.')}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Current Subscription */}
                <SettingsCard
                    title={t('billing.subscription', 'Subscription')}
                    description={t('billing.subscription_desc', 'Manage your subscription plan')}
                >
                    <div className="space-y-4">
                        {subscription ? (
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {subscription.plan || t('billing.unknown_plan', 'Unknown Plan')}
                                            {subscription.billing_interval && (
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    ({subscription.billing_interval === 'year' ? t('billing.yearly', 'Yearly') : t('billing.monthly', 'Monthly')})
                                                </span>
                                            )}
                                        </CardTitle>
                                        {getStatusBadge(subscription.status)}
                                    </div>
                                    {subscription.price !== null && (
                                        <div className="text-2xl font-bold">
                                            ${subscription.price}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /{subscription.billing_interval === 'year' ? t('billing.year', 'year') : t('billing.month', 'month')}
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Subscription Dates */}
                                    <div className="grid gap-2 text-sm">
                                        {subscription.starts_at && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>{t('billing.started', 'Started')}: {subscription.starts_at}</span>
                                            </div>
                                        )}
                                        {subscription.ends_at && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>
                                                    {isCancelled
                                                        ? t('billing.access_until', 'Access until')
                                                        : t('billing.renews_on', 'Renews on')}: {subscription.ends_at}
                                                </span>
                                            </div>
                                        )}
                                        {subscription.cancelled_at && (
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <AlertTriangleIcon className="h-4 w-4" />
                                                <span>{t('billing.cancelled_on', 'Cancelled on')}: {subscription.cancelled_at}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {customerPortalUrl && (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
                                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                                    {t('billing.manage_payment', 'Manage Payment')}
                                                    <ExternalLinkIcon className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}

                                        {/* Switch Plan (Monthly ↔ Yearly) */}
                                        {subscription.status === 'active' && subscription.billing_interval === 'month' && stripePaymentLinks.professional_yearly && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpgrade(stripePaymentLinks.professional_yearly)}
                                            >
                                                {t('billing.switch_yearly', 'Switch to Yearly (Save 17%)')}
                                            </Button>
                                        )}

                                        {/* Resume or Cancel */}
                                        {canResume ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={handleResumeSubscription}
                                            >
                                                {t('billing.resume', 'Resume Subscription')}
                                            </Button>
                                        ) : subscription.status === 'active' ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                        <XCircleIcon className="mr-2 h-4 w-4" />
                                                        {t('billing.cancel', 'Cancel Subscription')}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{t('billing.cancel_title', 'Cancel Subscription?')}</DialogTitle>
                                                        <DialogDescription>
                                                            {t('billing.cancel_desc', 'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')}
                                                            {subscription.ends_at && (
                                                                <span className="mt-2 block font-medium">
                                                                    {t('billing.access_until', 'Access until')}: {subscription.ends_at}
                                                                </span>
                                                            )}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">{t('common.nevermind', 'Nevermind')}</Button>
                                                        </DialogClose>
                                                        <Button variant="destructive" onClick={handleCancelSubscription}>
                                                            {t('billing.confirm_cancel', 'Yes, Cancel')}
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
                                    <CardTitle className="text-lg">{t('billing.free_plan', 'Free Plan')}</CardTitle>
                                    <CardDescription>
                                        {t('billing.free_plan_desc', "You're currently on the free Starter plan.")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/pricing">
                                            {t('billing.upgrade', 'Upgrade to Professional')}
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
                    description={t('billing.payment_history_desc', 'View your recent payments')}
                >
                    {payments.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('billing.date', 'Date')}</TableHead>
                                        <TableHead>{t('billing.plan', 'Plan')}</TableHead>
                                        <TableHead>{t('billing.amount', 'Amount')}</TableHead>
                                        <TableHead>{t('billing.status', 'Status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{payment.paid_at || '-'}</TableCell>
                                            <TableCell>{payment.plan || '-'}</TableCell>
                                            <TableCell>
                                                {payment.currency} {Number(payment.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ReceiptIcon className="h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                {t('billing.no_payments', 'No payment history yet')}
                            </p>
                        </div>
                    )}
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

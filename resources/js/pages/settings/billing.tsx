import { Head, Link } from '@inertiajs/react';
import { CreditCardIcon, ExternalLinkIcon, ReceiptIcon } from 'lucide-react';

import { SettingsCard } from '@/components/settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

interface Subscription {
    id: number;
    plan: string | null;
    status: string;
    ends_at: string | null;
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
}

export default function Billing({ subscription, payments, customerPortalUrl }: Props) {
    const { t } = useTranslations();

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.billing', 'Billing')} />

            <SettingsLayout>
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
                                        </CardTitle>
                                        {getStatusBadge(subscription.status)}
                                    </div>
                                    {subscription.ends_at && (
                                        <CardDescription>
                                            {subscription.status === 'cancelled'
                                                ? `${t('billing.access_until', 'Access until')}: ${subscription.ends_at}`
                                                : `${t('billing.renews_on', 'Renews on')}: ${subscription.ends_at}`}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {customerPortalUrl && (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
                                                    <CreditCardIcon className="mr-2 h-4 w-4" />
                                                    {t('billing.manage_subscription', 'Manage Subscription')}
                                                    <ExternalLinkIcon className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href="/pricing">
                                                {t('billing.change_plan', 'Change Plan')}
                                            </Link>
                                        </Button>
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

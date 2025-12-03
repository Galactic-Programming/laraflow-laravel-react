import { Head, usePage } from '@inertiajs/react';
import { CheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useTranslations } from '@/hooks/use-translations';
import { type SharedData } from '@/types';
import { login, register, dashboard } from '@/routes';
import { useState } from 'react';

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    billing_interval: string;
    features: string[] | null;
    stripe_price_id: string | null;
    is_free: boolean;
}

interface Props {
    plans: Plan[];
    currentPlan: string | null;
    isSubscribed: boolean;
    stripePaymentLinks: {
        professional_monthly: string | null;
        professional_yearly: string | null;
    };
}

export default function Pricing({ plans, currentPlan, isSubscribed, stripePaymentLinks }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();
    const [isAnnual, setIsAnnual] = useState(false);

    // Group plans by slug for pricing display
    const starterPlan = plans.find((p) => p.slug === 'starter');
    const monthlyPlan = plans.find((p) => p.slug === 'professional-monthly');
    const yearlyPlan = plans.find((p) => p.slug === 'professional-yearly');

    const getCheckoutUrl = (paymentLink: string | null) => {
        if (!paymentLink) return null;
        if (!auth.user) return login();

        // Append client_reference_id for webhook to identify user
        const url = new URL(paymentLink);
        url.searchParams.set('client_reference_id', String(auth.user.id));
        return url.toString();
    };

    const handleSubscribe = (paymentLink: string | null) => {
        const url = getCheckoutUrl(paymentLink);
        if (url) {
            window.location.href = url;
        }
    };

    const professionalPlan = isAnnual ? yearlyPlan : monthlyPlan;
    const professionalPaymentLink = isAnnual
        ? stripePaymentLinks.professional_yearly
        : stripePaymentLinks.professional_monthly;

    const starterFeatures = [
        t('pricing.feature_projects_5', 'Up to 5 projects'),
        t('pricing.feature_tasks_basic', 'Basic task management'),
        t('pricing.feature_calendar', 'Calendar view'),
        t('pricing.feature_progress', 'Progress tracking'),
    ];

    const professionalFeatures = [
        t('pricing.feature_projects_unlimited', 'Unlimited projects'),
        t('pricing.feature_tasks_advanced', 'Advanced task management'),
        t('pricing.feature_team', 'Team collaboration'),
        t('pricing.feature_analytics', 'Advanced analytics'),
        t('pricing.feature_integrations', 'Third-party integrations'),
        t('pricing.feature_priority', 'Priority support'),
    ];

    return (
        <>
            <Head title={t('pricing.title', 'Pricing')} />
            <div className="relative min-h-screen bg-background">
                <Header
                    auth={auth}
                    canRegister={true}
                    loginUrl={login()}
                    registerUrl={register()}
                    dashboardUrl={dashboard()}
                />

                <main className="container mx-auto px-4 py-16 sm:py-24">
                    {/* Header */}
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            {t('pricing.headline', 'Simple, transparent pricing')}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {t('pricing.subheadline', 'Choose the plan that works best for you. Upgrade or downgrade at any time.')}
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <span className={`font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t('pricing.monthly', 'Monthly')}
                        </span>
                        <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                        <span className={`font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t('pricing.annually', 'Annually')}
                        </span>
                        {isAnnual && (
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                {t('pricing.save_17', 'Save 17%')}
                            </Badge>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
                        {/* Starter Plan */}
                        <Card className={`relative ${currentPlan === 'starter' ? 'ring-2 ring-primary' : ''}`}>
                            {currentPlan === 'starter' && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    {t('pricing.current_plan', 'Current Plan')}
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{t('pricing.starter', 'Starter')}</CardTitle>
                                <CardDescription>
                                    {t('pricing.starter_desc', 'Perfect for personal projects')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">$0</span>
                                    <span className="text-muted-foreground">/{t('pricing.forever', 'forever')}</span>
                                </div>

                                <ul className="space-y-3">
                                    {starterFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={currentPlan === 'starter' || !auth.user}
                                    asChild={!auth.user}
                                >
                                    {auth.user ? (
                                        currentPlan === 'starter' ? (
                                            t('pricing.current', 'Current')
                                        ) : (
                                            t('pricing.get_started', 'Get Started')
                                        )
                                    ) : (
                                        <a href={register()}>{t('pricing.sign_up_free', 'Sign Up Free')}</a>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Professional Plan */}
                        <Card className={`relative border-primary ${currentPlan?.startsWith('professional') ? 'ring-2 ring-primary' : ''}`}>
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                                {currentPlan?.startsWith('professional')
                                    ? t('pricing.current_plan', 'Current Plan')
                                    : t('pricing.popular', 'Most Popular')}
                            </Badge>
                            <CardHeader>
                                <CardTitle className="text-2xl">{t('pricing.professional', 'Professional')}</CardTitle>
                                <CardDescription>
                                    {t('pricing.professional_desc', 'For power users & teams')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                        ${isAnnual ? yearlyPlan?.price ?? '99' : monthlyPlan?.price ?? '9.99'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        /{isAnnual ? t('pricing.year', 'year') : t('pricing.month', 'month')}
                                    </span>
                                </div>

                                <ul className="space-y-3">
                                    {professionalFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    disabled={currentPlan?.startsWith('professional') || !professionalPaymentLink}
                                    onClick={() => handleSubscribe(professionalPaymentLink)}
                                >
                                    {currentPlan?.startsWith('professional')
                                        ? t('pricing.current', 'Current')
                                        : isSubscribed
                                            ? t('pricing.upgrade', 'Upgrade')
                                            : t('pricing.subscribe', 'Subscribe')}
                                </Button>

                                {!professionalPaymentLink && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {t('pricing.coming_soon', 'Payment integration coming soon')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQ Link */}
                    <div className="mt-16 text-center">
                        <p className="text-muted-foreground">
                            {t('pricing.questions', 'Have questions?')}{' '}
                            <a href="/#faq" className="font-medium text-primary hover:underline">
                                {t('pricing.check_faq', 'Check our FAQ')}
                            </a>
                        </p>
                    </div>
                </main>

                <Footer
                    links={[
                        { label: t('footer.features', 'Features'), href: '/#features' },
                        { label: t('footer.pricing', 'Pricing'), href: '/pricing' },
                        { label: t('footer.faq', 'FAQ'), href: '/#faq' },
                    ]}
                    copyright={t('footer.copyright', '© {year} LaraFlow. Made with ❤️ for better productivity.')}
                />
            </div>
        </>
    );
}

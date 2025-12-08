import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface PricingPlan {
    /** Unique identifier */
    id: string;
    /** Plan title */
    title: string;
    /** Plan description */
    description: string;
    /** Monthly price */
    monthly: number;
    /** Annual price */
    annual: number;
    /** CTA button text */
    ctaText?: string;
    /** CTA button click handler */
    onCtaClick?: () => void;
    /** Whether this plan is highlighted/featured */
    featured?: boolean;
    /** List of features included */
    features?: string[];
}

export interface PricingProps {
    /** Array of pricing plans */
    plans: PricingPlan[];
    /** Section title */
    title?: string;
    /** Section description */
    description?: ReactNode;
    /** Monthly toggle label */
    monthlyLabel?: string;
    /** Annual toggle label */
    annualLabel?: string;
    /** Per month label */
    perMonthLabel?: string;
    /** Per year label */
    perYearLabel?: string;
    /** Save per year label (use {amount} for savings) */
    saveLabel?: string;
    /** Default CTA text */
    defaultCtaText?: string;
    /** Currency symbol */
    currency?: string;
    /** Show billing toggle */
    showToggle?: boolean;
    /** Default to annual billing */
    defaultAnnual?: boolean;
    /** Use muted background */
    mutedBackground?: boolean;
    /** Section ID for anchor links */
    id?: string;
    /** Additional class name */
    className?: string;
}

// ============================================================================
// PricingCards Component
// ============================================================================

export function PricingCards({
    plans,
    title = 'Select the Best Plan for You!',
    description = (
        <>
            Discover Our Flexible Plans, Compare Features, and Choose <br />
            the Ideal Option for Your Needs.
        </>
    ),
    monthlyLabel = 'Monthly',
    annualLabel = 'Annually',
    perMonthLabel = '/month',
    perYearLabel = '/year',
    saveLabel = 'Save {amount}/year',
    defaultCtaText = 'Get Started',
    currency = '$',
    showToggle = true,
    defaultAnnual = false,
    mutedBackground = true,
    id = 'pricing',
    className,
}: PricingProps) {
    const [isAnnual, setIsAnnual] = useState(defaultAnnual);

    return (
        <section
            id={id}
            className={cn(
                'py-12 sm:py-16',
                mutedBackground && 'bg-muted',
                className,
            )}
        >
            <div className="mx-auto max-w-7xl space-y-8 px-4 sm:space-y-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-xl text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {showToggle && (
                        <div className="flex items-center gap-3">
                            <span className="font-medium">{monthlyLabel}</span>
                            <Switch
                                checked={isAnnual}
                                onCheckedChange={setIsAnnual}
                            />
                            <span className="font-medium">{annualLabel}</span>
                        </div>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="flex items-center justify-center gap-6 max-lg:flex-col">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isAnnual={isAnnual}
                            currency={currency}
                            perMonthLabel={perMonthLabel}
                            perYearLabel={perYearLabel}
                            saveLabel={saveLabel}
                            defaultCtaText={defaultCtaText}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// PricingCard Component
// ============================================================================

export interface PricingCardProps {
    plan: PricingPlan;
    isAnnual: boolean;
    currency?: string;
    perMonthLabel?: string;
    perYearLabel?: string;
    saveLabel?: string;
    defaultCtaText?: string;
    className?: string;
}

export function PricingCard({
    plan,
    isAnnual,
    currency = '$',
    perMonthLabel = '/month',
    perYearLabel = '/year',
    saveLabel = 'Save {amount}/year',
    defaultCtaText = 'Get Started',
    className,
}: PricingCardProps) {
    const price = isAnnual ? plan.annual : plan.monthly;
    const periodLabel = isAnnual ? perYearLabel : perMonthLabel;
    const savings =
        isAnnual && plan.monthly > 0 ? plan.monthly * 12 - plan.annual : null;

    const priceDisplay = (priceClassName?: string) => (
        <div className={cn('flex flex-col items-end', priceClassName)}>
            <div className="flex items-end">
                <span className="text-5xl font-bold text-primary">
                    {currency}
                    {price}
                </span>
                <span className="ml-1 text-lg text-muted-foreground">
                    {periodLabel}
                </span>
            </div>
            {savings !== null && savings > 0 && (
                <span className="mt-1 text-sm font-medium text-green-600">
                    {saveLabel.replace(
                        '{amount}',
                        `${currency}${savings.toLocaleString()}`,
                    )}
                </span>
            )}
        </div>
    );

    return (
        <Card
            className={cn(
                'w-full shadow-none sm:w-lg',
                plan.featured && 'border-primary ring-2 ring-primary/20',
                className,
            )}
        >
            <CardContent className="flex justify-between gap-4">
                <div className="flex flex-col justify-center gap-5">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-3xl font-semibold">{plan.title}</h3>
                        <p className="text-base text-muted-foreground">
                            {plan.description}
                        </p>
                    </div>

                    {/* Mobile price display */}
                    {priceDisplay('sm:hidden')}

                    <Button className="w-fit" onClick={plan.onCtaClick}>
                        {plan.ctaText || defaultCtaText}
                    </Button>
                </div>

                <Separator
                    orientation="vertical"
                    className="!h-[132px] max-sm:hidden"
                />

                {/* Desktop price display */}
                <div className="flex items-end justify-end max-sm:hidden">
                    {priceDisplay()}
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================

export default PricingCards;

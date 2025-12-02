import { useState } from 'react';

import { ArrowRight, CheckCircle2, ExternalLink, Info, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface PricingFeature {
    text: string;
    included: boolean;
}

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    billedYearlyText?: string;
    discount?: string;
    isPopular?: boolean;
    buttonText?: string;
    variant?: 'default' | 'primary' | 'secondary' | 'accent';
    features: PricingFeature[];
    additionalFeatures?: PricingFeature[];
}

// =============================================================================
// Sub-components
// =============================================================================

interface FeatureListProps {
    features: PricingFeature[];
    className?: string;
}

function FeatureList({ features, className }: FeatureListProps) {
    return (
        <ul className={cn('space-y-3 text-left text-muted-foreground', className)}>
            {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                    {feature.included ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                        <XCircle className="mr-2 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    {feature.text}
                </li>
            ))}
        </ul>
    );
}

interface BillingToggleProps {
    isYearly: boolean;
    onToggle: (yearly: boolean) => void;
    className?: string;
}

function BillingToggle({ isYearly, onToggle, className }: BillingToggleProps) {
    return (
        <div className={cn('inline-flex items-center rounded-full bg-muted p-1', className)}>
            <button
                type="button"
                className={cn(
                    'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                    !isYearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
                onClick={() => onToggle(false)}
            >
                Monthly
            </button>
            <button
                type="button"
                className={cn(
                    'rounded-full px-6 py-2 text-sm font-medium transition-colors',
                    isYearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                )}
                onClick={() => onToggle(true)}
            >
                Yearly
            </button>
        </div>
    );
}

// Variant styles mapping
const variantStyles = {
    default: {
        button: 'bg-primary text-primary-foreground hover:bg-primary/90',
        badge: 'bg-muted text-primary',
        border: '',
    },
    primary: {
        button: 'bg-blue-600 text-white hover:bg-blue-700',
        badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
        border: '',
    },
    secondary: {
        button: 'bg-purple-600 text-white hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
        border: 'border-2 border-purple-600',
    },
    accent: {
        button: 'bg-amber-500 text-black hover:bg-amber-600',
        badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
        border: '',
    },
};

interface PricingCardProps {
    plan: PricingPlan;
    isYearly: boolean;
    onSelect?: (plan: PricingPlan) => void;
    showCompare?: boolean;
    onCompare?: (plan: PricingPlan) => void;
    showGuarantee?: boolean;
    guaranteeText?: string;
}

function PricingCard({
    plan,
    isYearly,
    onSelect,
    showCompare = true,
    onCompare,
    showGuarantee = true,
    guaranteeText = '7-day money-back guarantee',
}: PricingCardProps) {
    const variant = plan.variant ?? 'default';
    const styles = variantStyles[variant];
    const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
    const price = isFree ? 0 : isYearly ? plan.priceYearly : plan.priceMonthly;
    const period = isFree ? '/mo' : isYearly ? '/yr' : '/mo';

    return (
        <div
            className={cn(
                'relative flex flex-col rounded-xl border bg-muted p-6',
                plan.isPopular && styles.border,
                plan.isPopular && 'shadow-xl',
            )}
        >
            {/* Popular badge */}
            {plan.isPopular && (
                <div
                    className={cn(
                        'absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold',
                        variant === 'secondary' ? 'bg-purple-600 text-white' : 'bg-primary text-primary-foreground',
                    )}
                >
                    Most Popular
                </div>
            )}

            {/* Discount badge */}
            {plan.discount && (
                <div className={cn('absolute right-6 top-6 rounded-full px-2 py-1 text-xs font-semibold', styles.badge)}>
                    {plan.discount}
                </div>
            )}

            {/* Plan header */}
            <h2 className="mb-2 text-2xl font-semibold">{plan.name}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>

            {/* Price */}
            <div className="mb-6 flex items-baseline">
                <span className="text-5xl font-bold">${price}</span>
                <span className="text-xl text-muted-foreground">{period}</span>
            </div>

            {/* Billing info */}
            <p className="mb-6 text-sm text-muted-foreground">
                {isFree ? plan.billedYearlyText ?? 'Upgrade any time' : isYearly ? plan.billedYearlyText : 'Billed monthly'}
            </p>

            {/* CTA Button */}
            <Button className={cn('font-medium', styles.button)} onClick={() => onSelect?.(plan)}>
                {plan.buttonText ?? 'Get started'}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Guarantee */}
            {showGuarantee && !isFree && (
                <div className="mb-6 mt-4 flex items-center justify-center text-xs text-muted-foreground">
                    <Info className="mr-1 size-3" />
                    <span>{guaranteeText}</span>
                </div>
            )}

            {/* Features */}
            <div className="flex-grow">
                <FeatureList features={plan.features} />

                {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
                    <>
                        <h3 className="mb-3 mt-6 text-sm font-semibold">Additional Features:</h3>
                        <FeatureList features={plan.additionalFeatures} />
                    </>
                )}
            </div>

            {/* Compare button */}
            {showCompare && (
                <Button variant="ghost" className="mt-8 w-full text-muted-foreground" onClick={() => onCompare?.(plan)}>
                    Compare plans
                    <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export interface PricingTableProps {
    plans: PricingPlan[];
    title?: string;
    description?: string;
    defaultYearly?: boolean;
    onPlanSelect?: (plan: PricingPlan) => void;
    onCompare?: (plan: PricingPlan) => void;
    showHeader?: boolean;
    showCompare?: boolean;
    showGuarantee?: boolean;
    guaranteeText?: string;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
}

export default function PricingTable({
    plans,
    title = 'Pricing',
    description = 'Choose the plan that works best for you.',
    defaultYearly = true,
    onPlanSelect,
    onCompare,
    showHeader = true,
    showCompare = true,
    showGuarantee = true,
    guaranteeText,
    className,
    columns = 4,
}: PricingTableProps) {
    const [isYearly, setIsYearly] = useState(defaultYearly);

    const gridCols = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
    };

    return (
        <div className={cn('min-h-screen px-4 py-12 sm:px-6 lg:px-8', className)}>
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                {showHeader && (
                    <header className="mb-12 space-y-4 text-center">
                        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
                        <p className="text-balance text-lg text-muted-foreground">{description}</p>
                    </header>
                )}

                {/* Billing Toggle */}
                <div className="mb-12 text-center">
                    <BillingToggle isYearly={isYearly} onToggle={setIsYearly} />
                </div>

                {/* Plans Grid */}
                <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8', gridCols[columns])}>
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isYearly={isYearly}
                            onSelect={onPlanSelect}
                            onCompare={onCompare}
                            showCompare={showCompare}
                            showGuarantee={showGuarantee}
                            guaranteeText={guaranteeText}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Export sub-components for flexibility
export { BillingToggle, FeatureList, PricingCard };

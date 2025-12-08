import type { ComponentType, ReactNode } from 'react';

import { Link, type InertiaLinkProps } from '@inertiajs/react';
import { ArrowRightIcon, type LucideIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface FeatureItem {
    /** Icon component to display */
    icon: ComponentType | LucideIcon;
    /** Feature title */
    title: string;
    /** Feature description */
    description: string;
    /** Card border color classes */
    cardBorderColor?: string;
    /** Avatar/icon text color classes */
    avatarTextColor?: string;
    /** Avatar/icon background color classes */
    avatarBgColor?: string;
}

export interface FeaturesHeaderProps {
    /** Section title */
    title?: string;
    /** Section description */
    description?: string;
    /** CTA button text */
    ctaText?: string;
    /** CTA button link */
    ctaHref?: InertiaLinkProps['href'];
    /** Hide CTA button */
    hideCta?: boolean;
    /** Custom header content (overrides default) */
    children?: ReactNode;
}

export interface FeaturesProps extends FeaturesHeaderProps {
    /** Array of feature items to display */
    features: FeatureItem[];
    /** Number of columns (default: 3) */
    columns?: 2 | 3 | 4;
    /** Section ID for anchor links */
    id?: string;
    /** Additional class name */
    className?: string;
}

// ============================================================================
// Features Section Component
// ============================================================================

export function Features({
    features,
    title = 'Powerful Features for Your Productivity',
    description = 'Explore the tools designed to help you manage projects efficiently, stay organized, and achieve your goals with ease.',
    ctaText = 'Explore all features',
    ctaHref = '#',
    hideCta = false,
    columns = 3,
    id = 'features',
    className,
    children,
}: FeaturesProps) {
    const gridCols = {
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <section id={id} className={cn('py-12 sm:py-16', className)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {children ? (
                    children
                ) : (
                    <div className="mb-8 space-y-4 sm:mb-12">
                        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                            {title}
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            {description}
                        </p>
                        {!hideCta && (
                            <Button
                                variant="outline"
                                className="rounded-lg text-base shadow-none has-[>svg]:px-6"
                                size="lg"
                                asChild
                            >
                                <Link href={ctaHref}>
                                    {ctaText}
                                    <ArrowRightIcon />
                                </Link>
                            </Button>
                        )}
                    </div>
                )}

                {/* Features Grid */}
                <div className={cn('grid gap-6', gridCols[columns])}>
                    {features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// Feature Card Component
// ============================================================================

export interface FeatureCardProps {
    feature: FeatureItem;
    className?: string;
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
    const Icon = feature.icon;

    return (
        <Card
            className={cn(
                'shadow-none transition-colors duration-300',
                feature.cardBorderColor || 'border-border hover:border-primary',
                className,
            )}
        >
            <CardContent>
                <Avatar
                    className={cn(
                        'mb-6 size-10 rounded-md',
                        feature.avatarTextColor || 'text-primary',
                    )}
                >
                    <AvatarFallback
                        className={cn(
                            'rounded-md [&>svg]:size-6',
                            feature.avatarBgColor || 'bg-primary/10',
                        )}
                    >
                        <Icon />
                    </AvatarFallback>
                </Avatar>
                <h6 className="mb-2 text-lg font-semibold">{feature.title}</h6>
                <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================

export default Features;

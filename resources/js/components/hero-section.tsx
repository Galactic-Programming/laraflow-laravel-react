import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, type InertiaLinkProps } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface HeroBadgeProps {
    /** Badge label text */
    label?: string;
    /** Badge description text */
    description?: string;
}

export interface HeroTitleProps {
    /** First line of the title */
    line1?: string;
    /** Highlighted/underlined word */
    highlight?: string;
    /** Text after the highlight */
    line2?: string;
}

export interface HeroCtaProps {
    /** CTA button text */
    text?: string;
    /** CTA button link */
    href?: InertiaLinkProps['href'];
    /** Secondary CTA button text */
    secondaryText?: string;
    /** Secondary CTA button link */
    secondaryHref?: InertiaLinkProps['href'];
}

export interface HeroSectionProps {
    /** Badge configuration */
    badge?: HeroBadgeProps | false;
    /** Title configuration or custom ReactNode */
    title?: HeroTitleProps | ReactNode;
    /** Description text or custom ReactNode */
    description?: ReactNode;
    /** CTA buttons configuration */
    cta?: HeroCtaProps | false;
    /** Custom content below CTA (e.g., image, video) */
    children?: ReactNode;
    /** Section ID for anchor links */
    id?: string;
    /** Additional class name */
    className?: string;
    /** Content container class name */
    contentClassName?: string;
}

// ============================================================================
// Underline SVG Component
// ============================================================================

export const HeroUnderline = () => (
    <svg
        width="223"
        height="12"
        viewBox="0 0 223 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 bottom-0 w-full translate-y-1/2 max-sm:hidden"
    >
        <path
            d="M1.11716 10.428C39.7835 4.97282 75.9074 2.70494 114.894 1.98894C143.706 1.45983 175.684 0.313587 204.212 3.31596C209.925 3.60546 215.144 4.59884 221.535 5.74551"
            stroke="url(#paint0_linear_hero)"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <defs>
            <linearGradient
                id="paint0_linear_hero"
                x1="18.8541"
                y1="3.72033"
                x2="42.6487"
                y2="66.6308"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="var(--primary)" />
                <stop offset="1" stopColor="var(--primary-foreground)" />
            </linearGradient>
        </defs>
    </svg>
);

// ============================================================================
// Default Values
// ============================================================================

const defaultBadge: HeroBadgeProps = {
    label: 'AI-Powered',
    description: 'Smart solution for personal productivity',
};

const defaultTitle: HeroTitleProps = {
    line1: 'Personal Project Management',
    highlight: 'Simplified',
    line2: 'Workflow for Success!',
};

const defaultDescription = (
    <>
        Take control of your projects with our intuitive management platform.
        <br />
        From planning tasks to tracking progress, achieve your goals effortlessly.
    </>
);

const defaultCta: HeroCtaProps = {
    text: 'Get Started',
    href: '#',
};

// ============================================================================
// HeroSection Component
// ============================================================================

export function HeroSection({
    badge = defaultBadge,
    title = defaultTitle,
    description = defaultDescription,
    cta = defaultCta,
    children,
    id,
    className,
    contentClassName,
}: HeroSectionProps) {
    // Check if title is HeroTitleProps object
    const isHeroTitleProps = (t: HeroSectionProps['title']): t is HeroTitleProps => {
        return typeof t === 'object' && t !== null && 'line1' in t;
    };

    // Render title content
    const renderTitle = (): ReactNode => {
        // If title is a ReactNode (custom content)
        if (!isHeroTitleProps(title)) {
            return title as ReactNode;
        }

        const { line1, highlight, line2 } = title;

        return (
            <>
                {line1}
                {(highlight || line2) && <br />}
                {highlight && (
                    <span className="relative">
                        {highlight}
                        <HeroUnderline />
                    </span>
                )}
                {line2 && ` ${line2}`}
            </>
        );
    };

    return (
        <section
            id={id}
            className={cn(
                'flex min-h-[calc(80dvh-4rem)] flex-1 flex-col justify-between gap-8 overflow-x-hidden pt-6 sm:gap-12 sm:pt-12 lg:gap-16 lg:pt-16',
                className
            )}
        >
            {/* Hero Content */}
            <div
                className={cn(
                    'mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8',
                    contentClassName
                )}
            >
                {/* Badge */}
                {badge && (
                    <div className="bg-muted flex items-center gap-2.5 rounded-full border px-3 py-2">
                        {badge.label && <Badge>{badge.label}</Badge>}
                        {badge.description && (
                            <span className="text-muted-foreground">{badge.description}</span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold leading-[1.29167] text-balance sm:text-4xl lg:text-5xl">
                    {renderTitle()}
                </h1>

                {/* Description */}
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}

                {/* CTA Buttons */}
                {cta && (
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {cta.text && cta.href && (
                            <Button size="lg" asChild>
                                <Link href={cta.href}>{cta.text}</Link>
                            </Button>
                        )}
                        {cta.secondaryText && cta.secondaryHref && (
                            <Button size="lg" variant="outline" asChild>
                                <Link href={cta.secondaryHref}>{cta.secondaryText}</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Content (Image, Video, etc.) */}
            {children}
        </section>
    );
}

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================

export default HeroSection;

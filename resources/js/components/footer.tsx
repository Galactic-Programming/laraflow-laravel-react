import { Link, type InertiaLinkProps } from '@inertiajs/react';
import { GithubIcon, TwitterIcon, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface FooterLink {
    /** Link label */
    label: string;
    /** Link URL */
    href: string;
    /** Open in new tab */
    external?: boolean;
}

export interface FooterSocialLink {
    /** Icon component */
    icon: LucideIcon;
    /** Link URL */
    href: string;
    /** Accessible label */
    label: string;
}

export interface FooterProps {
    /** Brand name */
    brandName?: string;
    /** Logo component or element */
    logo?: ReactNode;
    /** Home link URL */
    homeHref?: InertiaLinkProps['href'];
    /** Navigation links */
    links?: FooterLink[];
    /** Social media links */
    socialLinks?: FooterSocialLink[];
    /** Copyright text (use {year} for dynamic year) */
    copyright?: string;
    /** Show separator between main and copyright */
    showSeparator?: boolean;
    /** Use muted background */
    mutedBackground?: boolean;
    /** Additional class name */
    className?: string;
}

// ============================================================================
// Default Values
// ============================================================================

const defaultLinks: FooterLink[] = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: 'mailto:contact@laraflow.app' },
];

const defaultSocialLinks: FooterSocialLink[] = [
    { icon: GithubIcon, href: 'https://github.com', label: 'GitHub' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
];

// ============================================================================
// Footer Component
// ============================================================================

export function Footer({
    brandName = 'LaraFlow',
    logo,
    homeHref = '/',
    links = defaultLinks,
    socialLinks = defaultSocialLinks,
    copyright = '© {year} LaraFlow. Made with ❤️ for better productivity.',
    showSeparator = true,
    mutedBackground = true,
    className,
}: FooterProps) {
    const currentYear = new Date().getFullYear();
    const formattedCopyright = copyright.replace('{year}', String(currentYear));

    return (
        <footer className={cn(mutedBackground && 'bg-muted', className)}>
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8">
                {/* Logo */}
                <Link href={homeHref} className="flex items-center gap-3">
                    {logo || (
                        <AppLogoIcon className="size-8 fill-current text-foreground" />
                    )}
                    <span className="font-semibold">{brandName}</span>
                </Link>

                {/* Navigation Links */}
                {links.length > 0 && (
                    <div className="flex items-center gap-5 text-sm whitespace-nowrap">
                        {links.map((link) =>
                            link.external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            ),
                        )}
                    </div>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.href}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={social.label}
                            >
                                <social.icon className="size-5" />
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {showSeparator && <Separator />}

            <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6">
                <p className="text-center text-sm text-balance text-muted-foreground">
                    {formattedCopyright}
                </p>
            </div>
        </footer>
    );
}

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================

export default Footer;

import { useTranslations } from '@/hooks/use-translations';
import {
    FacebookIcon,
    GithubIcon,
    LinkedinIcon,
    TwitterIcon,
} from 'lucide-react';

export function AppFooter() {
    const { t } = useTranslations();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="flex items-center justify-between gap-3 border-t border-sidebar-border/50 px-6 py-3 text-muted-foreground max-sm:flex-col sm:gap-6 md:px-4 md:max-lg:flex-col">
            <p className="text-center text-sm text-balance">
                © {currentYear}{' '}
                <a href="/" className="text-primary hover:underline">
                    LaraFlow
                </a>
                ,{' '}
                {t(
                    'common.footer_tagline',
                    'Made for better project management',
                )}
            </p>
            <div className="flex items-center gap-5">
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                    aria-label="GitHub"
                >
                    <GithubIcon className="size-4" />
                </a>
                <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                    aria-label="Twitter"
                >
                    <TwitterIcon className="size-4" />
                </a>
                <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                    aria-label="LinkedIn"
                >
                    <LinkedinIcon className="size-4" />
                </a>
                <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                    aria-label="Facebook"
                >
                    <FacebookIcon className="size-4" />
                </a>
            </div>
        </footer>
    );
}

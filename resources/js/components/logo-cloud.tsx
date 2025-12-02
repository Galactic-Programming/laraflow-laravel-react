import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface LogoItem {
    /** Icon element (SVG or component) */
    icon: ReactNode;
    /** Name of the logo/brand */
    name: string;
    /** Optional link URL */
    href?: string;
}

export interface LogoCloudProps {
    /** Array of logo items */
    logos?: LogoItem[];
    /** Section title (ReactNode for custom styling) */
    title?: ReactNode;
    /** First part of title (for i18n) */
    titlePart1?: string;
    /** Second part of title with underline (for i18n) */
    titlePart2?: string;
    /** Section description */
    description?: string;
    /** Show logos inside a card */
    showCard?: boolean;
    /** Show logo names on desktop */
    showNames?: boolean;
    /** Use muted background */
    mutedBackground?: boolean;
    /** Section ID for anchor links */
    id?: string;
    /** Additional class name */
    className?: string;
    /** Custom header content (overrides title/description) */
    children?: ReactNode;
}

// ============================================================================
// Pre-built Logo Icons (for convenience)
// ============================================================================

export const SlackIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
);

export const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
);

export const MicrosoftIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623" />
    </svg>
);

export const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

export const NotionIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
);

export const DropboxIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6.001-3.822L6 18.371z" />
    </svg>
);

export const FigmaIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zM8.148 24c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v4.49c0 2.476-2.014 4.49-4.588 4.49zm-.001-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02 3.019-1.355 3.019-3.02v-3.019H8.147zM8.148 8.981c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981H8.148zm-.001-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V1.471H8.147zM8.148 15.02c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98H8.148zm-.001-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V7.511H8.147zM24 10.53c0 2.476-2.014 4.49-4.49 4.49h-4.588V6.04h4.588c2.476 0 4.49 2.014 4.49 4.49zm-4.49-3.019h-3.117v6.038h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019z" />
    </svg>
);

export const TrelloIcon = () => (
    <svg viewBox="0 0 24 24" className="h-7 w-auto fill-current">
        <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
    </svg>
);

// ============================================================================
// Default Integrations Data
// ============================================================================

export const defaultIntegrations: LogoItem[] = [
    { icon: <SlackIcon />, name: 'Slack' },
    { icon: <GoogleIcon />, name: 'Google' },
    { icon: <MicrosoftIcon />, name: 'Microsoft' },
    { icon: <GitHubIcon />, name: 'GitHub' },
    { icon: <NotionIcon />, name: 'Notion' },
    { icon: <DropboxIcon />, name: 'Dropbox' },
    { icon: <FigmaIcon />, name: 'Figma' },
    { icon: <TrelloIcon />, name: 'Trello' },
];

// ============================================================================
// Default Title Component
// ============================================================================

const DefaultTitle = ({ part1 = 'Seamlessly', part2 = 'integrates with your favorite tools' }: { part1?: string; part2?: string }) => (
    <>
        <span>{part1}</span>{' '}
        <span className="relative z-1">
            {part2}
            <span className="bg-primary absolute bottom-1 left-0 -z-1 h-px w-full"></span>
        </span>
    </>
);

// ============================================================================
// LogoCloud Component
// ============================================================================

export function LogoCloud({
    logos = defaultIntegrations,
    title,
    titlePart1,
    titlePart2,
    description = 'Connect with the apps you already use to streamline your workflow.',
    showCard = true,
    showNames = true,
    mutedBackground = true,
    id,
    className,
    children,
}: LogoCloudProps) {
    const displayTitle = title ?? <DefaultTitle part1={titlePart1} part2={titlePart2} />;

    const LogosContent = (
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 text-muted-foreground">
            {logos.map((item, index) => {
                const content = (
                    <>
                        {item.icon}
                        {showNames && (
                            <span className="text-sm font-medium max-sm:hidden">{item.name}</span>
                        )}
                    </>
                );

                return item.href ? (
                    <a
                        key={index}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 transition-colors hover:text-foreground"
                        title={item.name}
                    >
                        {content}
                    </a>
                ) : (
                    <div
                        key={index}
                        className="flex items-center gap-2 transition-colors hover:text-foreground"
                        title={item.name}
                    >
                        {content}
                    </div>
                );
            })}
        </div>
    );

    return (
        <section
            id={id}
            className={cn('py-12 sm:py-16', mutedBackground && 'bg-muted', className)}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {children ? (
                    children
                ) : (
                    <div className="mb-8 space-y-4 text-center sm:mb-12">
                        <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">{displayTitle}</h2>
                        {description && (
                            <p className="text-muted-foreground text-xl">{description}</p>
                        )}
                    </div>
                )}

                {/* Logos */}
                {showCard ? (
                    <Card className="py-14 shadow-lg">
                        <CardContent className="px-14">{LogosContent}</CardContent>
                    </Card>
                ) : (
                    LogosContent
                )}
            </div>
        </section>
    );
}

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================

export default LogoCloud;

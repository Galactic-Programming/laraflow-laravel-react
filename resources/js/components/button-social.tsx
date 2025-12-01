import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SocialProvider {
    name: string;
    icon: ReactNode;
    href: string;
    className?: string;
}

interface ButtonSocialProps {
    providers: SocialProvider[];
    className?: string;
    labelPrefix?: string;
}

// Pre-defined social provider configurations
export const socialProviders = {
    google: {
        name: 'Google',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-5">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 32.091 29.316 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.149 28.991 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.297 16.012 18.789 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.149 28.991 3 24 3 16.318 3 9.656 7.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 43c5.241 0 10.031-2.007 13.59-5.277l-6.26-5.28C29.289 33.466 26.773 34.5 24 34.5c-5.285 0-9.773-3.389-11.393-8.115l-6.56 5.053C8.359 37.977 15.624 43 24 43z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.03 3.091-3.332 5.466-6.673 6.943l.001-.001 6.26 5.28C38.01 37.991 44 33 44 23c0-1.341-.138-2.651-.389-3.917z" />
            </svg>
        ),
        href: '/auth/google/redirect',
        className: '!border-[#e84133] !text-[#e84133]',
    },
    github: {
        name: 'GitHub',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.88 3.16 9.02 7.54 10.48.55.1.75-.24.75-.53 0-.26-.01-1.12-.02-2.03-3.07.67-3.72-1.31-3.72-1.31-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.07-.67.07-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.54 1.19 3.16.91.1-.7.38-1.19.69-1.46-2.45-.28-5.02-1.23-5.02-5.49 0-1.21.43-2.19 1.13-2.96-.11-.28-.49-1.42.11-2.95 0 0 .93-.3 3.05 1.13A10.6 10.6 0 0 1 12 6.84c.94 0 1.88.13 2.76.38 2.12-1.43 3.05-1.13 3.05-1.13.6 1.53.22 2.67.11 2.95.7.77 1.13 1.75 1.13 2.96 0 4.27-2.58 5.21-5.04 5.48.39.34.73 1.01.73 2.04 0 1.47-.01 2.66-.01 3.03 0 .29.2.64.76.53A10.72 10.72 0 0 0 23.1 11.6C23.1 5.33 18.27.5 12 .5z" />
            </svg>
        ),
        href: '/auth/github/redirect',
        className: 'border-black text-black dark:border-white dark:text-white',
    },
    facebook: {
        name: 'Facebook',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="#0866fe">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        href: '/auth/facebook/redirect',
        className: '!border-[#0866fe] !text-[#0866fe]',
    },
    twitter: {
        name: 'X',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 dark:invert" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        href: '/auth/twitter/redirect',
        className: 'border-black text-black dark:border-white dark:text-white',
    },
};

export function ButtonSocial({
    providers,
    className,
    labelPrefix = 'Continue with',
}: ButtonSocialProps) {
    return (
        <div className={cn('flex w-full flex-col justify-center gap-3', className)}>
            {providers.map((provider) => (
                <Button
                    key={provider.name}
                    variant="outline"
                    className={provider.className}
                    asChild
                >
                    <a href={provider.href} aria-label={`${labelPrefix} ${provider.name}`}>
                        {provider.icon}
                        <span className="flex flex-1 justify-center">
                            {labelPrefix} {provider.name}
                        </span>
                    </a>
                </Button>
            ))}
        </div>
    );
}

import { AlertError } from '@/components/alert-error';
import { GitHubIcon, GoogleIcon } from '@/components/logo-cloud';
import { SettingsCard } from '@/components/settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';
import { Link2, Link2Off } from 'lucide-react';
import { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

type Provider = 'google' | 'github';

type ConnectionsProps = {
    connections: Record<Provider, boolean>;
    status?: string;
};

interface ConnectionItemProps {
    name: string;
    description: string;
    icon: ReactNode;
    isConnected: boolean;
    linkUrl: string;
    unlinkAction: string;
    connectLabel: string;
    disconnectLabel: string;
    connectedLabel: string;
    notConnectedLabel: string;
}

// =============================================================================
// Components
// =============================================================================

function ConnectionItem({
    name,
    description,
    icon,
    isConnected,
    linkUrl,
    unlinkAction,
    connectLabel,
    disconnectLabel,
    connectedLabel,
    notConnectedLabel,
}: ConnectionItemProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium">{name}</h4>
                        <Badge variant={isConnected ? 'default' : 'secondary'}>
                            {isConnected ? connectedLabel : notConnectedLabel}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            <div>
                {isConnected ? (
                    <Form
                        action={unlinkAction}
                        method="delete"
                        options={{ preserveScroll: true }}
                    >
                        {({ processing }) => (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={processing}
                            >
                                <Link2Off className="mr-2 size-4" />
                                {disconnectLabel}
                            </Button>
                        )}
                    </Form>
                ) : (
                    <Button variant="outline" size="sm" asChild>
                        <a href={linkUrl}>
                            <Link2 className="mr-2 size-4" />
                            {connectLabel}
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// Main Component
// =============================================================================

export default function Connections({ connections, status }: ConnectionsProps) {
    const { t } = useTranslations();
    const linkUrl = (provider: Provider) =>
        `/auth/${provider}/redirect` as const;
    const unlinkAction = (provider: Provider) =>
        `/settings/connections/${provider}` as const;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.connections', 'Connections'),
            href: '/settings/connections',
        },
    ];

    const { props } = usePage<{
        errors?: { oauth?: string; provider?: string };
    }>();
    const errors = props.errors;

    // Collect all error messages
    const errorMessages: string[] = [];
    if (errors?.oauth) errorMessages.push(errors.oauth);
    if (errors?.provider) errorMessages.push(errors.provider);

    return (
        <AppLayout breadcrumbs={breadcrumbs} showBackground={false}>
            <Head title={t('settings.connections', 'Social Connections')} />
            <SettingsLayout>
                <SettingsCard
                    title={t('settings.connections', 'Social Connections')}
                    description={t(
                        'settings.connections_desc',
                        'Connect your accounts to enable single sign-on and easier access to your account.',
                    )}
                >
                    <div className="space-y-4">
                        {/* Success Status */}
                        {status && (
                            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                <svg
                                    className="size-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {status}
                            </div>
                        )}

                        {/* Error Messages */}
                        {errorMessages.length > 0 && (
                            <AlertError errors={errorMessages} />
                        )}

                        {/* Google Connection */}
                        <ConnectionItem
                            name="Google"
                            description={t(
                                'settings.sign_in_google',
                                'Sign in with your Google account',
                            )}
                            icon={<GoogleIcon />}
                            isConnected={connections.google}
                            linkUrl={linkUrl('google')}
                            unlinkAction={unlinkAction('google')}
                            connectLabel={t('settings.connect', 'Connect')}
                            disconnectLabel={t(
                                'settings.disconnect',
                                'Disconnect',
                            )}
                            connectedLabel={t(
                                'settings.connected',
                                'Connected',
                            )}
                            notConnectedLabel={t(
                                'settings.not_connected',
                                'Not connected',
                            )}
                        />

                        {/* GitHub Connection */}
                        <ConnectionItem
                            name="GitHub"
                            description={t(
                                'settings.sign_in_github',
                                'Sign in with your GitHub account',
                            )}
                            icon={<GitHubIcon />}
                            isConnected={connections.github}
                            linkUrl={linkUrl('github')}
                            unlinkAction={unlinkAction('github')}
                            connectLabel={t('settings.connect', 'Connect')}
                            disconnectLabel={t(
                                'settings.disconnect',
                                'Disconnect',
                            )}
                            connectedLabel={t(
                                'settings.connected',
                                'Connected',
                            )}
                            notConnectedLabel={t(
                                'settings.not_connected',
                                'Not connected',
                            )}
                        />
                    </div>
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Form, Head, usePage } from '@inertiajs/react';

type ConnectionsProps = {
    connections: {
        google: boolean;
        github: boolean;
    };
    status?: string;
};

export default function Connections({ connections, status }: ConnectionsProps) {
    // Use unified redirect route for linking (same as login route)
    const linkUrl = (provider: 'google' | 'github') =>
        `/auth/${provider}/redirect` as const;

    const { props } = usePage<{
        errors?: { oauth?: string; provider?: string };
    }>();
    const errors = props.errors;

    const unlinkAction = (provider: 'google' | 'github') =>
        `/settings/connections/${provider}` as const;

    return (
        <AppLayout>
            <Head title="Social connections" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-bold uppercase tracking-wide">
                                Social Connections
                            </h2>
                            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Link your Google or GitHub account to sign in
                                more easily.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {/* Google */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold uppercase tracking-wide">
                                        Google
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {connections.google
                                            ? 'Linked'
                                            : 'Not linked'}
                                    </p>
                                </div>
                                <div>
                                    {connections.google ? (
                                        <Form
                                            action={unlinkAction('google')}
                                            method="delete"
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    disabled={processing}
                                                    className="outline"
                                                >
                                                    Unlink
                                                </Button>
                                            )}
                                        </Form>
                                    ) : (
                                        <Button
                                            asChild
                                            className="outline"
                                        >
                                            <a href={linkUrl('google')}>
                                                Link
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* GitHub */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold uppercase tracking-wide">
                                        GitHub
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {connections.github
                                            ? 'Linked'
                                            : 'Not linked'}
                                    </p>
                                </div>
                                <div>
                                    {connections.github ? (
                                        <Form
                                            action={unlinkAction('github')}
                                            method="delete"
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    disabled={processing}
                                                    className="outline"
                                                >
                                                    Unlink
                                                </Button>
                                            )}
                                        </Form>
                                    ) : (
                                        <Button
                                            asChild
                                            className="outline"
                                        >
                                            <a href={linkUrl('github')}>
                                                Link
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {status && (
                            <div className="mt-4 border-2 border-green-600 bg-green-100 p-3 text-sm font-bold text-green-800 dark:border-green-400 dark:bg-green-900 dark:text-green-200">
                                {status}
                            </div>
                        )}
                        {errors?.oauth && (
                            <div className="mt-4 border-2 border-red-600 bg-red-100 p-3 text-sm font-bold text-red-800 dark:border-red-400 dark:bg-red-900 dark:text-red-200">
                                {errors.oauth}
                            </div>
                        )}
                        {errors?.provider && (
                            <div className="mt-4 border-2 border-red-600 bg-red-100 p-3 text-sm font-bold text-red-800 dark:border-red-400 dark:bg-red-900 dark:text-red-200">
                                {errors.provider}
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

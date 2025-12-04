import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { ProfileHeader } from '@/components/profile-header';
import { SettingsCard } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.profile', 'Profile settings'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} showBackground={false}>
            <Head title={t('settings.profile', 'Profile settings')} />

            <SettingsLayout>
                {/* Profile Header with Avatar */}
                <SettingsCard
                    title={t('settings.profile', 'Profile')}
                    description={t('settings.profile_desc', 'Your public profile information')}
                >
                    <div className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col gap-4">
                            <ProfileHeader
                                name={auth.user.name}
                                avatarUrl={auth.user.avatar}
                                email={auth.user.email}
                                showCard={false}
                                avatarSize="md"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <Form
                                    action="/settings/avatar"
                                    method="patch"
                                    encType="multipart/form-data"
                                    options={{ preserveScroll: true }}
                                    className="flex flex-wrap items-center gap-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <Input
                                                type="file"
                                                name="avatar"
                                                accept="image/*"
                                                className="w-full max-w-48"
                                            />
                                            <Button
                                                type="submit"
                                                variant="default"
                                                size="sm"
                                                disabled={processing}
                                            >
                                                {t('settings.upload', 'Upload')}
                                            </Button>
                                            <InputError message={errors.avatar} />
                                        </>
                                    )}
                                </Form>

                                {auth.user.avatar && (
                                    <Form
                                        action="/settings/avatar"
                                        method="delete"
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={processing}
                                            >
                                                {t('settings.remove_avatar', 'Remove')}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    </div>
                </SettingsCard>

                {/* Profile Information Form */}
                <SettingsCard
                    title={t('settings.profile_info', 'Personal Information')}
                    description={t('settings.profile_info_desc', 'Update your name and email address')}
                >
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('auth.full_name', 'Full Name')}</Label>
                                        <Input
                                            id="name"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            autoComplete="name"
                                            placeholder={t('auth.enter_name', 'Enter your full name')}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('auth.email', 'Email Address')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            autoComplete="username"
                                            placeholder={t('auth.enter_email', 'Enter your email')}
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-medium underline underline-offset-4 hover:no-underline"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>
                                            {status === 'verification-link-sent' && (
                                                <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                    {t('auth.verification_sent', 'A new verification link has been sent to your email address.')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                <Separator />

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        {t('common.save', 'Save Changes')}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            {t('settings.saved', 'Saved successfully')}
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsCard>

                {/* Danger Zone */}
                <SettingsCard
                    title={t('settings.delete_account', 'Danger Zone')}
                    description={t('settings.delete_account_desc', 'Irreversible and destructive actions')}
                    danger
                >
                    <DeleteUser />
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

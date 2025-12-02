import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { SettingsCard } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Key } from 'lucide-react';
import { useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <SettingsCard
                    title="Update Password"
                    description="Ensure your account is using a long, random password to stay secure. We recommend using a password manager."
                >
                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <Key className="size-5 text-primary" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Password Security</p>
                            <p>Your password is your digital key. Keep it safe and secure!</p>
                        </div>
                    </div>

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }
                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                    />
                                    <InputError message={errors.current_password} />
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        Update Password
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Password updated successfully
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

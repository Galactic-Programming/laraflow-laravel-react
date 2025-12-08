import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { ChevronLeftIcon } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslations();

    return (
        <AuthLayout
            title={t('auth.forgot_password', 'Forgot Password?')}
            description={t(
                'auth.forgot_password_desc',
                "Enter your email and we'll send you instructions to reset your password",
            )}
        >
            <Head title={t('auth.forgot_password', 'Forgot password')} />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">
                                    {t('auth.email', 'Email address')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    autoComplete="email"
                                    placeholder={t(
                                        'auth.enter_email',
                                        'Enter your email address',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                {t('auth.send_reset_link', 'Send Reset Link')}
                            </Button>
                        </div>

                        <Link
                            href={login()}
                            className="group mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            <span>
                                {t('auth.back_to_login', 'Back to login')}
                            </span>
                        </Link>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

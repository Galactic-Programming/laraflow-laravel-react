import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';

export default function ConfirmPassword() {
    const { t } = useTranslations();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <AuthLayout
            title={t('auth.confirm_password', 'Confirm Password')}
            description={t(
                'auth.confirm_password_desc',
                'This is a secure area of the application. Please confirm your password before continuing.',
            )}
        >
            <Head title={t('auth.confirm_password', 'Confirm password')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">
                                {t('auth.password', 'Password')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={
                                        isPasswordVisible ? 'text' : 'password'
                                    }
                                    name="password"
                                    autoFocus
                                    autoComplete="current-password"
                                    placeholder="••••••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setIsPasswordVisible((prev) => !prev)
                                    }
                                    className="absolute inset-y-0 right-0 rounded-l-none text-muted-foreground hover:bg-transparent hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {isPasswordVisible ? (
                                        <EyeOffIcon className="size-4" />
                                    ) : (
                                        <EyeIcon className="size-4" />
                                    )}
                                    <span className="sr-only">
                                        {isPasswordVisible
                                            ? 'Hide password'
                                            : 'Show password'}
                                    </span>
                                </Button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            {t('auth.confirm_password', 'Confirm Password')}
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}

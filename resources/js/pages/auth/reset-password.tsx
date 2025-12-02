import { useState } from 'react';
import { ChevronLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { login } from '@/routes';
import { update } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    return (
        <AuthLayout
            title="Reset Password"
            description="Please enter your new password to update your account security"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Email (readonly) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    readOnly
                                    className="bg-muted"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* New Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">New password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        name="password"
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="new-password"
                                        placeholder="••••••••••••"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsPasswordVisible(prev => !prev)}
                                        className="absolute inset-y-0 right-0 rounded-l-none text-muted-foreground hover:bg-transparent hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {isPasswordVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                        <span className="sr-only">
                                            {isPasswordVisible ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                                        name="password_confirmation"
                                        tabIndex={2}
                                        autoComplete="new-password"
                                        placeholder="••••••••••••"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsConfirmPasswordVisible(prev => !prev)}
                                        className="absolute inset-y-0 right-0 rounded-l-none text-muted-foreground hover:bg-transparent hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {isConfirmPasswordVisible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                        <span className="sr-only">
                                            {isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                                        </span>
                                    </Button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={3}
                                disabled={processing}
                                data-test="reset-password-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Set New Password
                            </Button>
                        </div>

                        <Link
                            href={login()}
                            className="group mx-auto flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                            <span>Back to login</span>
                        </Link>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

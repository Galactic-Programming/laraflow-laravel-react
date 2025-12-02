import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const socialRedirect = (provider: 'google' | 'github') =>
        `/auth/${provider}/redirect` as const;

    return (
        <AuthLayout
            title="Create an account"
            description="Ship Faster and Focus on Growth"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        name="password"
                                        tabIndex={3}
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
                                        tabIndex={4}
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

                            {/* Privacy Policy Agreement */}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="terms"
                                    name="terms"
                                    tabIndex={5}
                                />
                                <Label htmlFor="terms" className="text-sm font-normal">
                                    <span className="text-muted-foreground">I agree to the</span>{' '}
                                    <TextLink href="/terms">
                                        Terms
                                    </TextLink>
                                    <span className="text-muted-foreground"> & </span>
                                    <TextLink href="/privacy">
                                        Privacy Policy
                                    </TextLink>
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                tabIndex={6}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Create account
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Sign in instead
                            </TextLink>
                        </p>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground uppercase">or continue with</span>
                            <Separator className="flex-1" />
                        </div>

                        {/* Social Signup */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                            >
                                <a
                                    href={socialRedirect('google')}
                                    aria-label="Continue with Google"
                                    data-test="register-google"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 48 48"
                                        className="size-5"
                                        aria-hidden
                                    >
                                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 32.091 29.316 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.149 28.991 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
                                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.816C14.297 16.012 18.789 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 5.149 28.991 3 24 3 16.318 3 9.656 7.337 6.306 14.691z" />
                                        <path fill="#4CAF50" d="M24 43c5.241 0 10.031-2.007 13.59-5.277l-6.26-5.28C29.289 33.466 26.773 34.5 24 34.5c-5.285 0-9.773-3.389-11.393-8.115l-6.56 5.053C8.359 37.977 15.624 43 24 43z" />
                                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.03 3.091-3.332 5.466-6.673 6.943l.001-.001 6.26 5.28C38.01 37.991 44 33 44 23c0-1.341-.138-2.651-.389-3.917z" />
                                    </svg>
                                    Google
                                </a>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                            >
                                <a
                                    href={socialRedirect('github')}
                                    aria-label="Continue with GitHub"
                                    data-test="register-github"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className="size-5"
                                        aria-hidden
                                        fill="currentColor"
                                    >
                                        <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.88 3.16 9.02 7.54 10.48.55.1.75-.24.75-.53 0-.26-.01-1.12-.02-2.03-3.07.67-3.72-1.31-3.72-1.31-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.07-.67.07-.67 1.1.08 1.68 1.13 1.68 1.13.97 1.67 2.54 1.19 3.16.91.1-.7.38-1.19.69-1.46-2.45-.28-5.02-1.23-5.02-5.49 0-1.21.43-2.19 1.13-2.96-.11-.28-.49-1.42.11-2.95 0 0 .93-.3 3.05 1.13A10.6 10.6 0 0 1 12 6.84c.94 0 1.88.13 2.76.38 2.12-1.43 3.05-1.13 3.05-1.13.6 1.53.22 2.67.11 2.95.7.77 1.13 1.75 1.13 2.96 0 4.27-2.58 5.21-5.04 5.48.39.34.73 1.01.73 2.04 0 1.47-.01 2.66-.01 3.03 0 .29.2.64.76.53A10.72 10.72 0 0 0 23.1 11.6C23.1 5.33 18.27.5 12 .5z" />
                                    </svg>
                                    GitHub
                                </a>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

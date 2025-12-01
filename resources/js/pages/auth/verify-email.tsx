import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify your email"
            description="An activation link has been sent to your email address. Please check your inbox and click on the link to complete the activation process."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="flex flex-col gap-5">
                {({ processing }) => (
                    <div className="grid gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner className="mr-2" />}
                            Resend verification email
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Didn't get the email?{' '}
                            <TextLink href={logout()}>
                                Log out
                            </TextLink>
                            {' '}and try again
                        </p>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { useTranslations } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';

export default function TwoFactorChallenge() {
    const { t } = useTranslations();
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: t('auth.recovery_code', 'Recovery Code'),
                description: t('auth.recovery_code_desc', 'Please confirm access to your account by entering one of your emergency recovery codes'),
                toggleText: t('auth.use_auth_code', 'Use authentication code instead'),
            };
        }

        return {
            title: t('auth.two_factor_title', 'Two Factor Authentication'),
            description: t('auth.two_factor_desc', 'Please confirm access to your account by entering the code provided by your authenticator application'),
            toggleText: t('auth.use_recovery_code', 'Use a recovery code'),
        };
    }, [showRecoveryInput, t]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title={t('auth.two_factor_title', 'Two-Factor Authentication')} />

            <Form
                {...store.form()}
                className="flex flex-col gap-5"
                resetOnError
                resetOnSuccess={!showRecoveryInput}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        <div className="grid gap-4">
                            {showRecoveryInput ? (
                                <div className="space-y-1.5">
                                    <Label htmlFor="recovery_code">{t('auth.recovery_code', 'Recovery code')}</Label>
                                    <Input
                                        id="recovery_code"
                                        name="recovery_code"
                                        type="text"
                                        placeholder={t('auth.enter_recovery_code', 'Enter your recovery code')}
                                        autoFocus
                                    />
                                    <InputError message={errors.recovery_code} />
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="code">{t('auth.enter_code', 'Code')}</Label>
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => toggleRecoveryMode(clearErrors)}
                                        >
                                            {authConfigContent.toggleText}
                                        </button>
                                    </div>
                                    <InputOTP
                                        id="code"
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                    >
                                        <InputOTPGroup className="w-full justify-center gap-3">
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className="rounded-md border"
                                                    />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner className="mr-2" />}
                                {t('auth.verify_sign_in', 'Verify & Sign in')}
                            </Button>
                        </div>

                        {showRecoveryInput && (
                            <p className="text-center text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    className="font-medium text-foreground hover:underline"
                                    onClick={() => toggleRecoveryMode(clearErrors)}
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

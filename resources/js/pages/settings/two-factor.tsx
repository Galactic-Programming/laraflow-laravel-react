import { SettingsCard } from '@/components/settings';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/use-translations';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { KeyRound, ShieldBan, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const { t } = useTranslations();
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.two_factor', 'Two-Factor Authentication'),
            href: show.url(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} showBackground={false}>
            <Head title={t('nav.two_factor', 'Two-Factor Authentication')} />
            <SettingsLayout>
                <SettingsCard
                    title={t(
                        'settings.two_factor',
                        'Two-Factor Authentication',
                    )}
                    description={t(
                        'settings.two_factor_desc',
                        'Add an extra layer of security to your account by requiring a verification code in addition to your password.',
                    )}
                    headerActions={
                        <Badge
                            variant={
                                twoFactorEnabled ? 'default' : 'destructive'
                            }
                        >
                            {twoFactorEnabled
                                ? t('settings.enabled', 'Enabled')
                                : t('settings.disabled', 'Disabled')}
                        </Badge>
                    }
                >
                    {twoFactorEnabled ? (
                        <div className="space-y-6">
                            {/* Status Message */}
                            <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <ShieldCheck className="mt-0.5 size-5 text-green-600 dark:text-green-400" />
                                <div className="text-sm">
                                    <p className="font-medium text-green-800 dark:text-green-200">
                                        {t(
                                            'settings.2fa_active',
                                            'Two-factor authentication is active',
                                        )}
                                    </p>
                                    <p className="text-green-700 dark:text-green-300">
                                        {t(
                                            'settings.2fa_active_desc',
                                            'You will be prompted for a secure, random code during login from your authenticator app.',
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Recovery Codes */}
                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <Separator />

                            {/* Disable Button */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">
                                        {t(
                                            'settings.disable_2fa',
                                            'Disable 2FA',
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'settings.disable_2fa_desc',
                                            'This will remove the extra security layer from your account',
                                        )}
                                    </p>
                                </div>
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan className="mr-2 size-4" />
                                            {t(
                                                'settings.disable_2fa',
                                                'Disable 2FA',
                                            )}
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Available Methods */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">
                                    {t(
                                        'settings.available_methods',
                                        'Available Authentication Methods',
                                    )}
                                </h4>

                                {/* Authenticator App */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                            <Smartphone className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">
                                                {t(
                                                    'settings.authenticator_app',
                                                    'Authenticator App',
                                                )}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    'settings.authenticator_app_desc',
                                                    'Use Google Authenticator, Authy, or similar apps for time-based codes',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">
                                        {t(
                                            'settings.recommended',
                                            'Recommended',
                                        )}
                                    </Badge>
                                </div>

                                {/* Recovery Codes Info */}
                                <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <KeyRound className="size-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">
                                                {t(
                                                    'settings.recovery_codes',
                                                    'Recovery Codes',
                                                )}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {t(
                                                    'settings.recovery_codes_info',
                                                    'Backup codes for account recovery (generated after enabling 2FA)',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Enable Button */}
                            <div className="flex items-center gap-4">
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck className="mr-2 size-4" />
                                        {t(
                                            'settings.continue_setup',
                                            'Continue Setup',
                                        )}
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck className="mr-2 size-4" />
                                                {t(
                                                    'settings.enable_2fa',
                                                    'Enable 2FA',
                                                )}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}
                </SettingsCard>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />
            </SettingsLayout>
        </AppLayout>
    );
}

import { SettingsCard } from '@/components/settings';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <SettingsLayout>
                <SettingsCard
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security to your account by requiring a verification code in addition to your password."
                    headerActions={
                        <Badge variant={twoFactorEnabled ? 'default' : 'destructive'}>
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
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
                                        Two-factor authentication is active
                                    </p>
                                    <p className="text-green-700 dark:text-green-300">
                                        You will be prompted for a secure, random code during login from your authenticator app.
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
                                    <p className="font-medium text-destructive">Disable 2FA</p>
                                    <p className="text-sm text-muted-foreground">
                                        This will remove the extra security layer from your account
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
                                            Disable 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Available Methods */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Available Authentication Methods</h4>

                                {/* Authenticator App */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                            <Smartphone className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Authenticator App</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Use Google Authenticator, Authy, or similar apps for time-based codes
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">Recommended</Badge>
                                </div>

                                {/* Recovery Codes Info */}
                                <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                            <KeyRound className="size-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Recovery Codes</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Backup codes for account recovery (generated after enabling 2FA)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Enable Button */}
                            <div className="flex items-center gap-4">
                                {hasSetupData ? (
                                    <Button onClick={() => setShowSetupModal(true)}>
                                        <ShieldCheck className="mr-2 size-4" />
                                        Continue Setup
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() => setShowSetupModal(true)}
                                    >
                                        {({ processing }) => (
                                            <Button type="submit" disabled={processing}>
                                                <ShieldCheck className="mr-2 size-4" />
                                                Enable 2FA
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

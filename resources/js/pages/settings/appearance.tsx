import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import { SettingsCard } from '@/components/settings';
import { useTranslations } from '@/hooks/use-translations';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('nav.appearance', 'Appearance settings'),
            href: editAppearance().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} showBackground={false}>
            <Head title={t('nav.appearance', 'Appearance settings')} />

            <SettingsLayout>
                <SettingsCard
                    title={t('settings.appearance', 'Appearance')}
                    description={t(
                        'settings.appearance_desc',
                        'Customize the look and feel of your account. Choose your preferred theme and display settings.',
                    )}
                >
                    <AppearanceTabs />
                </SettingsCard>
            </SettingsLayout>
        </AppLayout>
    );
}

import { BackgroundSelector } from '@/components/background-selector';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { t } = useTranslations();

    return (
        <div className={cn('space-y-6', className)} {...props}>
            {/* Background Effect Section */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">
                    {t('settings.background_effect', 'Background Effect')}
                </Label>
                <BackgroundSelector />
            </div>
        </div>
    );
}

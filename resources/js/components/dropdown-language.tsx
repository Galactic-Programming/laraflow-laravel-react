import type { ReactNode } from 'react';

import { router, usePage } from '@inertiajs/react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';

type Props = {
    trigger: ReactNode;
    defaultOpen?: boolean;
    align?: 'start' | 'center' | 'end';
};

export default function LanguageDropdown({
    defaultOpen,
    align = 'end',
    trigger,
}: Props) {
    const { locale, availableLocales } = usePage<SharedData>().props;

    const handleLocaleChange = (newLocale: string) => {
        if (newLocale !== locale) {
            // Flush all cached Inertia data before changing locale
            router.flushAll();
            router.post(
                `/locale/${newLocale}`,
                {},
                {
                    preserveScroll: true,
                    preserveState: false,
                },
            );
        }
    };

    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align={align}>
                <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={handleLocaleChange}
                >
                    {Object.entries(availableLocales).map(([code, name]) => (
                        <DropdownMenuRadioItem
                            key={code}
                            value={code}
                            className="pl-2 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground [&>span]:hidden"
                        >
                            {name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

import { useState } from 'react';
import type { ReactNode } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
    trigger: ReactNode;
    defaultOpen?: boolean;
    align?: 'start' | 'center' | 'end';
};

export default function LanguageDropdown({ defaultOpen, align = 'end', trigger }: Props) {
    const [language, setLanguage] = useState('english');

    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align={align}>
                <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                    <DropdownMenuRadioItem
                        value="english"
                        className="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 [&>span]:hidden"
                    >
                        English
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                        value="german"
                        className="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 [&>span]:hidden"
                    >
                        Deutsch
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                        value="spanish"
                        className="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 [&>span]:hidden"
                    >
                        Española
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                        value="vietnamese"
                        className="data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground pl-2 [&>span]:hidden"
                    >
                        Tiếng Việt
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

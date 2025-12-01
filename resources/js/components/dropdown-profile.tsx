import type { ReactNode } from 'react';
import { SettingsIcon, LogOutIcon } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type SharedData } from '@/types';

type Props = {
    trigger: ReactNode;
    defaultOpen?: boolean;
    align?: 'start' | 'center' | 'end';
};

export default function ProfileDropdown({ trigger, defaultOpen, align = 'end' }: Props) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <DropdownMenu defaultOpen={defaultOpen}>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align={align}>
                <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2.5 font-normal">
                    <div className="relative">
                        <Avatar className="size-10">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
                    </div>
                    <div className="flex flex-1 flex-col items-start">
                        <span className="text-foreground text-base font-semibold">{auth.user.name}</span>
                        <span className="text-muted-foreground text-sm">{auth.user.email}</span>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="px-3 py-2">
                        <Link
                            className="flex w-full items-center"
                            href={edit()}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <SettingsIcon className="text-foreground mr-2 size-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="px-3 py-2">
                    <Link
                        className="flex w-full items-center text-destructive"
                        href={logout()}
                        as="button"
                        onClick={handleLogout}
                        data-test="logout-button"
                    >
                        <LogOutIcon className="mr-2 size-4" />
                        <span>Log out</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

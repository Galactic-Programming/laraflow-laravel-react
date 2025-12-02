import { LanguagesIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import LanguageDropdown from '@/components/dropdown-language';
import ProfileDropdown from '@/components/dropdown-profile';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="hidden !h-4 sm:block" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-1.5">
                <AnimatedThemeToggler
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                />
                <LanguageDropdown
                    trigger={
                        <Button variant="ghost" size="icon">
                            <LanguagesIcon className="size-5" />
                        </Button>
                    }
                />
                <ProfileDropdown
                    trigger={
                        <Button variant="ghost" size="icon" className="size-9">
                            <Avatar className="size-8 rounded-md">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-md bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    }
                />
            </div>
        </header>
    );
}

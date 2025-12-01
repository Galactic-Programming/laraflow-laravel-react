import { MenuIcon } from 'lucide-react'
import { Link, type InertiaLinkProps } from '@inertiajs/react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from '@/components/ui/navigation-menu'

import { cn } from '@/lib/utils'

import AppLogoIcon from '@/components/app-logo-icon'

export type NavigationSection = {
    title: string
    href: string
}

type AuthUser = {
    id: number
    name: string
    email: string
} | null

type HeaderProps = {
    navigationData?: NavigationSection[]
    auth?: {
        user: AuthUser
    }
    canRegister?: boolean
    loginUrl?: InertiaLinkProps['href']
    registerUrl?: InertiaLinkProps['href']
    dashboardUrl?: InertiaLinkProps['href']
    className?: string
}

const Header = ({
    navigationData = [],
    auth,
    canRegister = true,
    loginUrl = '#',
    registerUrl = '#',
    dashboardUrl = '#',
    className
}: HeaderProps) => {
    const isAuthenticated = auth?.user != null
    const hasNavigation = navigationData.length > 0

    return (
        <header className={cn('bg-background sticky top-0 z-50 h-16 border-b', className)}>
            <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
                {/* Logo */}
                <Link href={dashboardUrl} className='flex items-center gap-3'>
                    <AppLogoIcon className='size-8 fill-current text-foreground' />
                </Link>

                {/* Navigation */}
                {hasNavigation && (
                    <NavigationMenu className='max-md:hidden'>
                        <NavigationMenuList className='flex-wrap justify-start gap-0'>
                            {navigationData.map(navItem => (
                                <NavigationMenuItem key={navItem.title}>
                                    <NavigationMenuLink
                                        href={navItem.href}
                                        className='text-muted-foreground hover:text-primary px-3 py-1.5 text-base! font-medium hover:bg-transparent'
                                    >
                                        {navItem.title}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                )}

                {/* Auth Buttons - Desktop */}
                <div className='flex items-center gap-2 max-md:hidden'>
                    {isAuthenticated ? (
                        <Button className='rounded-lg' asChild>
                            <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant='ghost' className='rounded-lg' asChild>
                                <Link href={loginUrl}>Log in</Link>
                            </Button>
                            {canRegister && (
                                <Button className='rounded-lg' asChild>
                                    <Link href={registerUrl}>Register</Link>
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Navigation for small screens */}
                <div className='flex items-center gap-2 md:hidden'>
                    {isAuthenticated ? (
                        <Button className='rounded-lg' asChild>
                            <Link href={dashboardUrl}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant='ghost' size='sm' className='rounded-lg' asChild>
                                <Link href={loginUrl}>Log in</Link>
                            </Button>
                            {canRegister && (
                                <Button size='sm' className='rounded-lg' asChild>
                                    <Link href={registerUrl}>Register</Link>
                                </Button>
                            )}
                        </>
                    )}

                    {hasNavigation && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='icon'>
                                    <MenuIcon />
                                    <span className='sr-only'>Menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56' align='end'>
                                {navigationData.map((item, index) => (
                                    <DropdownMenuItem key={index}>
                                        <a href={item.href}>{item.title}</a>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header

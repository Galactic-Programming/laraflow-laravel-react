import { AppBackground } from '@/components/app-background';
import { AppContent } from '@/components/app-content';
import { AppFooter } from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    showBackground?: boolean;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    showBackground = true,
}: PropsWithChildren<AppSidebarLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                {showBackground && <AppBackground />}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <main className="relative z-10 flex-1">{children}</main>
                <AppFooter />
            </AppContent>
        </AppShell>
    );
}

import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    showBackground?: boolean;
}

export default ({
    children,
    breadcrumbs,
    showBackground = true,
    ...props
}: AppLayoutProps) => (
    <AppLayoutTemplate
        breadcrumbs={breadcrumbs}
        showBackground={showBackground}
        {...props}
    >
        {children}
    </AppLayoutTemplate>
);

import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Translations {
    nav?: {
        home?: string;
        dashboard?: string;
        settings?: string;
        profile?: string;
        password?: string;
        appearance?: string;
        two_factor?: string;
        connections?: string;
    };
    auth?: {
        login?: string;
        register?: string;
        logout?: string;
        forgot_password?: string;
        reset_password?: string;
        confirm_password?: string;
        email?: string;
        password?: string;
        remember_me?: string;
    };
    settings?: {
        profile_info?: string;
        profile_info_desc?: string;
        update_password?: string;
        update_password_desc?: string;
        delete_account?: string;
        delete_account_desc?: string;
        appearance?: string;
        appearance_desc?: string;
        two_factor?: string;
        two_factor_desc?: string;
        connections?: string;
        connections_desc?: string;
    };
    common?: {
        save?: string;
        cancel?: string;
        delete?: string;
        confirm?: string;
        loading?: string;
        success?: string;
        error?: string;
        warning?: string;
    };
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    locale: string;
    availableLocales: Record<string, string>;
    translations: Translations;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    job_title?: string;
    company?: string;
    bio?: string;
    location?: string;
    is_visible?: boolean;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    active_subscription?: Subscription;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Plan {
    id: number;
    name: string;
    slug: 'starter' | 'professional';
    description?: string;
    price: number;
    billing_interval: 'monthly' | 'yearly';
    features?: string[];
    is_active: boolean;
}

export interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    status: 'active' | 'cancelled' | 'expired';
    starts_at: string | null;
    ends_at: string | null;
    cancelled_at: string | null;
    plan?: Plan;
}

export interface Payment {
    id: number;
    user_id: number;
    subscription_id?: number;
    plan_id?: number;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method?: string;
    transaction_id?: string;
    paid_at: string | null;
}

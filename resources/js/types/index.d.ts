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
        welcome_back?: string;
        sign_in_desc?: string;
        create_account?: string;
        create_account_desc?: string;
        full_name?: string;
        confirm_password_field?: string;
        enter_email?: string;
        enter_name?: string;
        already_have_account?: string;
        sign_in_instead?: string;
        no_account?: string;
        sign_up?: string;
        or_continue_with?: string;
        agree_terms?: string;
        terms?: string;
        privacy_policy?: string;
        send_reset_link?: string;
        back_to_login?: string;
        forgot_password_desc?: string;
        reset_password_desc?: string;
        new_password?: string;
        confirm_new_password?: string;
        verify_email?: string;
        verify_email_desc?: string;
        resend_verification?: string;
        verification_sent?: string;
        two_factor_title?: string;
        two_factor_desc?: string;
        enter_code?: string;
        use_recovery_code?: string;
        use_auth_code?: string;
        recovery_code?: string;
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
        profile?: string;
        profile_desc?: string;
        current_password?: string;
        new_password?: string;
        confirm_password?: string;
        saved?: string;
        upload?: string;
        remove_avatar?: string;
        enter_current_password?: string;
        enter_new_password?: string;
        confirm_new_password?: string;
        password_updated?: string;
        connect?: string;
        disconnect?: string;
        connected?: string;
        not_connected?: string;
        sign_in_google?: string;
        sign_in_github?: string;
        enabled?: string;
        disabled?: string;
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
        back?: string;
        continue?: string;
        submit?: string;
    };
    condition?: {
        terms_title?: string;
        terms_desc?: string;
        privacy_title?: string;
        privacy_desc?: string;
        back_to_register?: string;
        key_points?: string;
        terms_point_1?: string;
        terms_point_2?: string;
        terms_point_3?: string;
        privacy_point_1?: string;
        privacy_point_2?: string;
        privacy_point_3?: string;
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

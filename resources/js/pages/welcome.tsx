import FAQ from '@/components/faq';
import { Features, type FeatureItem } from '@/components/features-section';
import Footer from '@/components/footer';
import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import LogoCloud from '@/components/logo-cloud';
import { PricingCards, type PricingPlan } from '@/components/pricing';
import type { TestimonialItem } from '@/components/testimonials';
import Testimonials from '@/components/testimonials';
import { useTranslations } from '@/hooks/use-translations';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    BarChart3Icon,
    BellIcon,
    CalendarIcon,
    LayoutDashboardIcon,
    ListTodoIcon,
    UsersIcon,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    const featuresList: FeatureItem[] = [
        {
            icon: LayoutDashboardIcon,
            title: t('welcome.feature_dashboard_title', 'Intuitive Dashboard'),
            description: t(
                'welcome.feature_dashboard_desc',
                'Get a complete overview of all your projects at a glance. Track progress, deadlines, and priorities with our clean and organized dashboard.',
            ),
            cardBorderColor: 'border-primary/40 hover:border-primary',
            avatarTextColor: 'text-primary',
            avatarBgColor: 'bg-primary/10',
        },
        {
            icon: ListTodoIcon,
            title: t('welcome.feature_task_title', 'Task Management'),
            description: t(
                'welcome.feature_task_desc',
                'Create, organize, and prioritize tasks with ease. Break down projects into manageable steps and never miss a deadline again.',
            ),
            cardBorderColor:
                'border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400',
            avatarTextColor: 'text-green-600 dark:text-green-400',
            avatarBgColor: 'bg-green-600/10 dark:bg-green-400/10',
        },
        {
            icon: CalendarIcon,
            title: t('welcome.feature_schedule_title', 'Smart Scheduling'),
            description: t(
                'welcome.feature_schedule_desc',
                'Plan your work with integrated calendar views. Set reminders, schedule tasks, and stay on top of your commitments effortlessly.',
            ),
            cardBorderColor:
                'border-amber-600/40 hover:border-amber-600 dark:border-amber-400/40 dark:hover:border-amber-400',
            avatarTextColor: 'text-amber-600 dark:text-amber-400',
            avatarBgColor: 'bg-amber-600/10 dark:bg-amber-400/10',
        },
        {
            icon: BarChart3Icon,
            title: t('welcome.feature_progress_title', 'Progress Tracking'),
            description: t(
                'welcome.feature_progress_desc',
                'Visualize your productivity with detailed analytics and reports. Understand your work patterns and improve your efficiency over time.',
            ),
            cardBorderColor: 'border-destructive/40 hover:border-destructive',
            avatarTextColor: 'text-destructive',
            avatarBgColor: 'bg-destructive/10',
        },
        {
            icon: UsersIcon,
            title: t('welcome.feature_collab_title', 'Collaboration Tools'),
            description: t(
                'welcome.feature_collab_desc',
                'Share projects and collaborate with team members seamlessly. Assign tasks, leave comments, and work together in real-time.',
            ),
            cardBorderColor:
                'border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400',
            avatarTextColor: 'text-sky-600 dark:text-sky-400',
            avatarBgColor: 'bg-sky-600/10 dark:bg-sky-400/10',
        },
        {
            icon: BellIcon,
            title: t('welcome.feature_notify_title', 'Smart Notifications'),
            description: t(
                'welcome.feature_notify_desc',
                'Stay informed with intelligent reminders and updates. Get notified about upcoming deadlines, task changes, and important milestones.',
            ),
            cardBorderColor: 'border-primary/40 hover:border-primary',
            avatarTextColor: 'text-primary',
            avatarBgColor: 'bg-primary/10',
        },
    ];

    const testimonials: TestimonialItem[] = [
        {
            name: 'Emily Rodriguez',
            role: 'Freelance Designer',
            company: 'Self-employed',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png?width=40&height=40&format=auto',
            rating: 5,
            content: t(
                'welcome.testimonial_1',
                'This app completely transformed how I manage my freelance projects. I never miss deadlines anymore and my clients love the transparency.',
            ),
        },
        {
            name: 'David Kim',
            role: 'Software Engineer',
            company: 'Tech Startup',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png?width=40&height=40&format=auto',
            rating: 5,
            content: t(
                'welcome.testimonial_2',
                "Finally, a project management tool that doesn't feel overwhelming. Simple, intuitive, and exactly what I needed for my side projects.",
            ),
        },
        {
            name: 'Sarah Mitchell',
            role: 'Marketing Manager',
            company: 'Creative Agency',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png?width=40&height=40&format=auto',
            rating: 5,
            content: t(
                'welcome.testimonial_3',
                'The smart scheduling feature is a game-changer. I can now balance multiple campaigns effortlessly and stay on top of every task.',
            ),
        },
        {
            name: 'Michael Chen',
            role: 'Graduate Student',
            company: 'MIT',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png?width=40&height=40&format=auto',
            rating: 4,
            content: t(
                'welcome.testimonial_4',
                'Managing my thesis research alongside coursework was chaotic until I found this. The progress tracking keeps me motivated every day.',
            ),
        },
    ];

    const pricingData: PricingPlan[] = [
        {
            id: 'starter',
            title: t('welcome.pricing_starter', 'Starter'),
            description: t(
                'welcome.pricing_starter_desc',
                'Perfect for personal projects',
            ),
            monthly: 0,
            annual: 0,
        },
        {
            id: 'professional',
            title: t('welcome.pricing_pro', 'Professional'),
            description: t(
                'welcome.pricing_pro_desc',
                'For power users & teams',
            ),
            monthly: 9.99,
            annual: 99.99,
        },
    ];

    const faqItems = [
        {
            question: t(
                'welcome.faq_free_title',
                'Is the Starter plan really free forever?',
            ),
            answer: t(
                'welcome.faq_free_answer',
                'Yes! The Starter plan is completely free with no hidden fees. You can manage up to 5 projects with core features like task management, basic scheduling, and progress tracking. Upgrade anytime if you need more.',
            ),
        },
        {
            question: t(
                'welcome.faq_collab_title',
                'Can I collaborate with my team on the free plan?',
            ),
            answer: t(
                'welcome.faq_collab_answer',
                "The Starter plan is designed for personal use. For team collaboration features like shared projects, task assignments, comments, and real-time updates, you'll need the Professional plan which supports unlimited team members.",
            ),
        },
        {
            question: t(
                'welcome.faq_schedule_title',
                'How does the smart scheduling feature work?',
            ),
            answer: t(
                'welcome.faq_schedule_answer',
                'Our smart scheduling uses an integrated calendar view where you can drag and drop tasks, set due dates, and create reminders. It automatically highlights conflicts and helps you balance your workload across days and weeks.',
            ),
        },
        {
            question: t(
                'welcome.faq_integrate_title',
                'Can I integrate with other tools I already use?',
            ),
            answer: t(
                'welcome.faq_integrate_answer',
                'Absolutely! We integrate with popular tools like Slack, Google Calendar, GitHub, Notion, Trello, and more. This allows you to sync tasks, receive notifications, and keep your workflow seamless across platforms.',
            ),
        },
        {
            question: t(
                'welcome.faq_cancel_title',
                'What happens to my data if I cancel my subscription?',
            ),
            answer: t(
                'welcome.faq_cancel_answer',
                "Your data remains safe. If you cancel Professional, you'll be downgraded to the Starter plan and retain access to your first 5 projects. You can export all your data anytime from the settings page.",
            ),
        },
    ];

    return (
        <>
            <Head title={t('nav.home', 'Welcome')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen bg-background">
                {/* Header Section */}
                <Header
                    auth={auth}
                    canRegister={canRegister}
                    loginUrl={login()}
                    registerUrl={register()}
                    dashboardUrl={dashboard()}
                />

                {/* Main Content */}
                <main className="flex flex-col">
                    {/* Hero Section */}
                    <HeroSection
                        badge={{
                            label: t('welcome.hero_badge_label', 'AI-Powered'),
                            description: t(
                                'welcome.hero_badge_desc',
                                'Smart solution for personal productivity',
                            ),
                        }}
                        title={{
                            line1: t(
                                'welcome.hero_title_1',
                                'Personal Project Management',
                            ),
                            highlight: t(
                                'welcome.hero_highlight',
                                'Simplified',
                            ),
                            line2: t(
                                'welcome.hero_title_2',
                                'Workflow for Success!',
                            ),
                        }}
                        description={t(
                            'welcome.hero_desc',
                            'Take control of your projects with our intuitive management platform. From planning tasks to tracking progress, achieve your goals effortlessly.',
                        )}
                        cta={{
                            text: t('welcome.get_started', 'Get Started'),
                            href: register(),
                        }}
                        showRippleEffect
                    />

                    {/* Features Section */}
                    <Features
                        features={featuresList}
                        ctaHref={login()}
                        title={t(
                            'welcome.features_title',
                            'Powerful Features for Your Productivity',
                        )}
                        description={t(
                            'welcome.features_desc',
                            'Explore the tools designed to help you manage projects efficiently, stay organized, and achieve your goals with ease.',
                        )}
                        ctaText={t(
                            'welcome.features_cta',
                            'Explore all features',
                        )}
                    />

                    {/* Logo Cloud Section */}
                    <LogoCloud
                        titlePart1={t(
                            'welcome.integrations_title_1',
                            'Seamlessly',
                        )}
                        titlePart2={t(
                            'welcome.integrations_title_2',
                            'integrates with your favorite tools',
                        )}
                        description={t(
                            'welcome.integrations_desc',
                            'Connect with the apps you already use to streamline your workflow.',
                        )}
                    />

                    {/* Testimonials Section */}
                    <Testimonials
                        testimonials={testimonials}
                        subtitle={t(
                            'welcome.testimonials_subtitle',
                            'Success Stories',
                        )}
                        title={t(
                            'welcome.testimonials_title',
                            'What Our Users Say',
                        )}
                        description={t(
                            'welcome.testimonials_desc',
                            'See how people are achieving their goals and staying productive with our platform.',
                        )}
                        roleAtText={t('welcome.testimonials_role_at', 'at')}
                    />

                    {/* Pricing Section */}
                    <PricingCards
                        plans={pricingData}
                        title={t(
                            'welcome.pricing_title',
                            'Select the Best Plan for You!',
                        )}
                        description={t(
                            'welcome.pricing_desc',
                            'Discover Our Flexible Plans, Compare Features, and Choose the Ideal Option for Your Needs.',
                        )}
                        monthlyLabel={t('welcome.pricing_monthly', 'Monthly')}
                        annualLabel={t('welcome.pricing_annually', 'Annually')}
                        perMonthLabel={t('welcome.pricing_per_month', '/month')}
                        perYearLabel={t('welcome.pricing_per_year', '/year')}
                        saveLabel={t(
                            'welcome.pricing_save',
                            'Save {amount}/year',
                        )}
                        defaultCtaText={t(
                            'welcome.pricing_get_started',
                            'Get Started',
                        )}
                    />

                    {/* FAQ Section */}
                    <FAQ
                        faqItems={faqItems}
                        title={t(
                            'welcome.faq_title',
                            "Need Help? We've Got Answers",
                        )}
                        description={t(
                            'welcome.faq_desc',
                            'Explore Our Most Commonly Asked Questions and Find the Information You Need.',
                        )}
                    />
                </main>

                {/* Footer */}
                <Footer
                    links={[
                        {
                            label: t('welcome.footer_features', 'Features'),
                            href: '#features',
                        },
                        {
                            label: t('welcome.footer_pricing', 'Pricing'),
                            href: '#pricing',
                        },
                        { label: t('welcome.footer_faq', 'FAQ'), href: '#faq' },
                        {
                            label: t('welcome.footer_contact', 'Contact'),
                            href: 'mailto:contact@laraflow.app',
                        },
                    ]}
                    copyright={t(
                        'welcome.footer_copyright',
                        '© {year} LaraFlow. Made with ❤️ for better productivity.',
                    )}
                />
            </div>
        </>
    );
}

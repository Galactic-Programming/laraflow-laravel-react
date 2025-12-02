import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import HeroSection from '@/components/hero-section'
import Header from '@/components/header'
import { LayoutDashboardIcon, ListTodoIcon, CalendarIcon, BarChart3Icon, UsersIcon, BellIcon } from 'lucide-react'
import { Features, type FeatureItem } from '@/components/features-section'
import LogoCloud from '@/components/logo-cloud';
import Testimonials from '@/components/testimonials';
import type { TestimonialItem } from '@/components/testimonials';
import { PricingCards, type PricingPlan } from '@/components/pricing';
import FAQ from '@/components/faq';
import Footer from '@/components/footer';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const featuresList: FeatureItem[] = [
        {
            icon: LayoutDashboardIcon,
            title: 'Intuitive Dashboard',
            description:
                'Get a complete overview of all your projects at a glance. Track progress, deadlines, and priorities with our clean and organized dashboard.',
            cardBorderColor: 'border-primary/40 hover:border-primary',
            avatarTextColor: 'text-primary',
            avatarBgColor: 'bg-primary/10'
        },
        {
            icon: ListTodoIcon,
            title: 'Task Management',
            description:
                'Create, organize, and prioritize tasks with ease. Break down projects into manageable steps and never miss a deadline again.',
            cardBorderColor: 'border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400',
            avatarTextColor: 'text-green-600 dark:text-green-400',
            avatarBgColor: 'bg-green-600/10 dark:bg-green-400/10'
        },
        {
            icon: CalendarIcon,
            title: 'Smart Scheduling',
            description:
                'Plan your work with integrated calendar views. Set reminders, schedule tasks, and stay on top of your commitments effortlessly.',
            cardBorderColor: 'border-amber-600/40 hover:border-amber-600 dark:border-amber-400/40 dark:hover:border-amber-400',
            avatarTextColor: 'text-amber-600 dark:text-amber-400',
            avatarBgColor: 'bg-amber-600/10 dark:bg-amber-400/10'
        },
        {
            icon: BarChart3Icon,
            title: 'Progress Tracking',
            description:
                'Visualize your productivity with detailed analytics and reports. Understand your work patterns and improve your efficiency over time.',
            cardBorderColor: 'border-destructive/40 hover:border-destructive',
            avatarTextColor: 'text-destructive',
            avatarBgColor: 'bg-destructive/10'
        },
        {
            icon: UsersIcon,
            title: 'Collaboration Tools',
            description:
                'Share projects and collaborate with team members seamlessly. Assign tasks, leave comments, and work together in real-time.',
            cardBorderColor: 'border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400',
            avatarTextColor: 'text-sky-600 dark:text-sky-400',
            avatarBgColor: 'bg-sky-600/10 dark:bg-sky-400/10'
        },
        {
            icon: BellIcon,
            title: 'Smart Notifications',
            description:
                'Stay informed with intelligent reminders and updates. Get notified about upcoming deadlines, task changes, and important milestones.',
            cardBorderColor: 'border-primary/40 hover:border-primary',
            avatarTextColor: 'text-primary',
            avatarBgColor: 'bg-primary/10'
        }
    ]

    const testimonials: TestimonialItem[] = [
        {
            name: 'Emily Rodriguez',
            role: 'Freelance Designer',
            company: 'Self-employed',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png?width=40&height=40&format=auto',
            rating: 5,
            content: "This app completely transformed how I manage my freelance projects. I never miss deadlines anymore and my clients love the transparency."
        },
        {
            name: 'David Kim',
            role: 'Software Engineer',
            company: 'Tech Startup',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png?width=40&height=40&format=auto',
            rating: 5,
            content: "Finally, a project management tool that doesn't feel overwhelming. Simple, intuitive, and exactly what I needed for my side projects."
        },
        {
            name: 'Sarah Mitchell',
            role: 'Marketing Manager',
            company: 'Creative Agency',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png?width=40&height=40&format=auto',
            rating: 5,
            content: "The smart scheduling feature is a game-changer. I can now balance multiple campaigns effortlessly and stay on top of every task."
        },
        {
            name: 'Michael Chen',
            role: 'Graduate Student',
            company: 'MIT',
            avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png?width=40&height=40&format=auto',
            rating: 4,
            content: "Managing my thesis research alongside coursework was chaotic until I found this. The progress tracking keeps me motivated every day."
        }
    ]

    const pricingData: PricingPlan[] = [
        {
            id: 'starter',
            title: 'Starter',
            description: 'Perfect for personal projects',
            monthly: 0,
            annual: 0
        },
        {
            id: 'professional',
            title: 'Professional',
            description: 'For power users & teams',
            monthly: 9.99,
            annual: 99.99
        }
    ]

    const faqItems = [
        {
            question: 'Is the Starter plan really free forever?',
            answer:
                'Yes! The Starter plan is completely free with no hidden fees. You can manage up to 5 projects with core features like task management, basic scheduling, and progress tracking. Upgrade anytime if you need more.'
        },
        {
            question: 'Can I collaborate with my team on the free plan?',
            answer:
                'The Starter plan is designed for personal use. For team collaboration features like shared projects, task assignments, comments, and real-time updates, you\'ll need the Professional plan which supports unlimited team members.'
        },
        {
            question: 'How does the smart scheduling feature work?',
            answer:
                'Our smart scheduling uses an integrated calendar view where you can drag and drop tasks, set due dates, and create reminders. It automatically highlights conflicts and helps you balance your workload across days and weeks.'
        },
        {
            question: 'Can I integrate with other tools I already use?',
            answer:
                'Absolutely! We integrate with popular tools like Slack, Google Calendar, GitHub, Notion, Trello, and more. This allows you to sync tasks, receive notifications, and keep your workflow seamless across platforms.'
        },
        {
            question: 'What happens to my data if I cancel my subscription?',
            answer:
                'Your data remains safe. If you cancel Professional, you\'ll be downgraded to the Starter plan and retain access to your first 5 projects. You can export all your data anytime from the settings page.'
        }
    ]

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className='relative min-h-screen bg-background'>
                {/* Header Section */}
                <Header
                    auth={auth}
                    canRegister={canRegister}
                    loginUrl={login()}
                    registerUrl={register()}
                    dashboardUrl={dashboard()}
                />

                {/* Main Content */}
                <main className='flex flex-col'>
                    <HeroSection cta={{ text: 'Get Started', href: register() }} />

                    {/* Features Section */}
                    <Features features={featuresList} ctaHref={login()} />

                    {/* Logo Cloud Section */}
                    <LogoCloud />

                    {/* Testimonials Section */}
                    <Testimonials testimonials={testimonials} />

                    {/* Pricing Section */}
                    <PricingCards plans={pricingData} />

                    {/* FAQ Section */}
                    <FAQ faqItems={faqItems} />
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

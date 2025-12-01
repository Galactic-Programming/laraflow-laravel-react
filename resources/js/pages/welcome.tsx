import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import HeroSection from '@/components/hero-section'
import Header from '@/components/header'

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

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
                    <HeroSection />
                </main>
            </div>
        </>
    );
}

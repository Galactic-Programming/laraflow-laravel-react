import { Link } from '@inertiajs/react'
import { GithubIcon, TwitterIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import AppLogoIcon from '@/components/app-logo-icon'

const Footer = () => {
    return (
        <footer className='bg-muted'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
                {/* Logo */}
                <Link href='/' className='flex items-center gap-3'>
                    <AppLogoIcon className='size-8 fill-current text-foreground' />
                    <span className='font-semibold'>LaraFlow</span>
                </Link>

                <div className='flex items-center gap-5 whitespace-nowrap text-sm'>
                    <a href='#features' className='text-muted-foreground hover:text-foreground transition-colors'>Features</a>
                    <a href='#pricing' className='text-muted-foreground hover:text-foreground transition-colors'>Pricing</a>
                    <a href='#faq' className='text-muted-foreground hover:text-foreground transition-colors'>FAQ</a>
                    <a href='mailto:contact@laraflow.app' className='text-muted-foreground hover:text-foreground transition-colors'>Contact</a>
                </div>

                <div className='flex items-center gap-4'>
                    <a href='https://github.com' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-foreground transition-colors'>
                        <GithubIcon className='size-5' />
                    </a>
                    <a href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-foreground transition-colors'>
                        <TwitterIcon className='size-5' />
                    </a>
                </div>
            </div>

            <Separator />

            <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
                <p className='text-muted-foreground text-center text-sm text-balance'>
                    © {new Date().getFullYear()} LaraFlow. Made with ❤️ for better productivity.
                </p>
            </div>
        </footer>
    )
}

export default Footer

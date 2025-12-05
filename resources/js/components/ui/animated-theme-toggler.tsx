import { useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { useAppearance } from "@/hooks/use-appearance"

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const { appearance, updateAppearance } = useAppearance()
    const buttonRef = useRef<HTMLButtonElement>(null)

    const isDark = appearance === 'dark'

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        const newMode = isDark ? 'light' : 'dark'

        await document.startViewTransition(() => {
            flushSync(() => {
                updateAppearance(newMode)
            })
        }).ready

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        )
    }, [isDark, duration, updateAppearance])

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn(className)}
            {...props}
        >
            {isDark ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface CardTopImageAction {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?:
        | 'default'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
        | 'destructive';
}

interface CardTopImageProps {
    imageSrc: string;
    imageAlt?: string;
    title: string;
    description?: string;
    actions?: CardTopImageAction[];
    children?: ReactNode;
    className?: string;
}

export function CardTopImage({
    imageSrc,
    imageAlt = 'Card image',
    title,
    description,
    actions,
    children,
    className,
}: CardTopImageProps) {
    return (
        <Card className={cn('max-w-md pt-0', className)}>
            <CardContent className="px-0">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="aspect-video h-70 w-full rounded-t-xl object-cover"
                />
            </CardContent>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>
            {(actions || children) && (
                <CardFooter className="gap-3 max-sm:flex-col max-sm:items-stretch">
                    {actions?.map((action, index) => (
                        <Button
                            key={index}
                            variant={
                                action.variant ||
                                (index === 0 ? 'default' : 'outline')
                            }
                            onClick={action.onClick}
                            asChild={!!action.href}
                        >
                            {action.href ? (
                                <a href={action.href}>{action.label}</a>
                            ) : (
                                action.label
                            )}
                        </Button>
                    ))}
                    {children}
                </CardFooter>
            )}
        </Card>
    );
}

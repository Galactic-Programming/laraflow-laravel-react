import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Camera, Calendar, Mail, MapPin, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface ProfileMetaItem {
    icon: LucideIcon;
    label: string;
}

export interface ProfileBadge {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface ProfileHeaderProps {
    /** User's display name */
    name: string;
    /** User's avatar URL */
    avatarUrl?: string | null;
    /** User's subtitle (job title, role, etc.) */
    subtitle?: string;
    /** User's email address */
    email?: string;
    /** User's location */
    location?: string;
    /** Join date string (e.g., "March 2023") */
    joinedDate?: string;
    /** Custom meta items to display */
    metaItems?: ProfileMetaItem[];
    /** Badge to display next to name */
    badge?: ProfileBadge;
    /** Whether to show camera button on avatar */
    showCameraButton?: boolean;
    /** Camera button click handler */
    onCameraClick?: () => void;
    /** Action button (e.g., Edit Profile) */
    actionButton?: ReactNode;
    /** Whether to wrap in a Card */
    showCard?: boolean;
    /** Additional className */
    className?: string;
    /** Avatar size: 'sm' | 'md' | 'lg' */
    avatarSize?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Constants
// =============================================================================

const avatarSizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
} as const;

const avatarFallbackClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function buildDefaultMetaItems(
    email?: string,
    location?: string,
    joinedDate?: string,
): ProfileMetaItem[] {
    const items: ProfileMetaItem[] = [];

    if (email) {
        items.push({ icon: Mail, label: email });
    }
    if (location) {
        items.push({ icon: MapPin, label: location });
    }
    if (joinedDate) {
        items.push({ icon: Calendar, label: `Joined ${joinedDate}` });
    }

    return items;
}

// =============================================================================
// Component
// =============================================================================

export function ProfileHeader({
    name,
    avatarUrl,
    subtitle,
    email,
    location,
    joinedDate,
    metaItems,
    badge,
    showCameraButton = false,
    onCameraClick,
    actionButton,
    showCard = true,
    className,
    avatarSize = 'lg',
}: ProfileHeaderProps) {
    // Use custom meta items or build from individual props
    const displayMetaItems = metaItems ?? buildDefaultMetaItems(email, location, joinedDate);

    const content = (
        <div className={cn(
            'flex flex-col items-start gap-6 md:flex-row md:items-center',
            !showCard && className,
        )}>
            {/* Avatar */}
            <div className="relative">
                <Avatar className={avatarSizeClasses[avatarSize]}>
                    <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                    <AvatarFallback className={avatarFallbackClasses[avatarSize]}>
                        {getInitials(name)}
                    </AvatarFallback>
                </Avatar>
                {showCameraButton && (
                    <Button
                        size="icon"
                        variant="outline"
                        className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
                        onClick={onCameraClick}
                        type="button"
                    >
                        <Camera className="size-4" />
                    </Button>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
                {/* Name & Badge */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <h1 className="text-2xl font-bold">{name}</h1>
                    {badge && (
                        <Badge variant={badge.variant ?? 'secondary'}>
                            {badge.label}
                        </Badge>
                    )}
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-muted-foreground">{subtitle}</p>
                )}

                {/* Meta Items */}
                {displayMetaItems.length > 0 && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {displayMetaItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <item.icon className="size-4" />
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Button */}
            {actionButton}
        </div>
    );

    if (!showCard) {
        return content;
    }

    return (
        <Card className={className}>
            <CardContent className="pt-6">
                {content}
            </CardContent>
        </Card>
    );
}

// =============================================================================
// Example Data (for demo/testing)
// =============================================================================

export const exampleProfileData: ProfileHeaderProps = {
    name: 'John Doe',
    avatarUrl: 'https://bundui-images.netlify.app/avatars/08.png',
    subtitle: 'Senior Product Designer',
    email: 'john.doe@example.com',
    location: 'San Francisco, CA',
    joinedDate: 'March 2023',
    badge: { label: 'Pro Member', variant: 'secondary' },
    showCameraButton: true,
};

export default ProfileHeader;

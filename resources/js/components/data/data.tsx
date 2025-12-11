import {
    AlertTriangle,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Ban,
    BookOpen,
    Bug,
    CheckCheck,
    CheckCircle2,
    Circle,
    Clock,
    Eye,
    FileText,
    Folder,
    Search,
    TestTube,
    Wrench,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

export interface LabelOption {
    value: string;
    label: string;
    icon: LucideIcon;
}

export interface StatusOption {
    value: string;
    label: string;
    icon: LucideIcon;
}

export interface PriorityOption {
    value: string;
    label: string;
    icon: LucideIcon;
}

// Note: Labels are now translated via useTranslations hook
// in components that use them
export const labels: LabelOption[] = [
    {
        value: 'bug',
        label: 'Bug',
        icon: Bug,
    },
    {
        value: 'feature',
        label: 'Feature',
        icon: Folder,
    },
    {
        value: 'enhancement',
        label: 'Enhancement',
        icon: ArrowUp,
    },
    {
        value: 'documentation',
        label: 'Documentation',
        icon: BookOpen,
    },
    {
        value: 'testing',
        label: 'Testing',
        icon: TestTube,
    },
    {
        value: 'refactor',
        label: 'Refactor',
        icon: Wrench,
    },
    {
        value: 'urgent',
        label: 'Urgent',
        icon: AlertTriangle,
    },
    {
        value: 'blocked',
        label: 'Blocked',
        icon: Ban,
    },
    {
        value: 'needs_review',
        label: 'Needs Review',
        icon: Eye,
    },
    {
        value: 'in_review',
        label: 'In Review',
        icon: Search,
    },
    {
        value: 'approved',
        label: 'Approved',
        icon: CheckCheck,
    },
    {
        value: 'other',
        label: 'Other',
        icon: FileText,
    },
];

// Note: Status labels are now translated via useTranslations hook
// Use t('tasks.status_pending'), t('tasks.status_in_progress'), etc.
export const statuses: StatusOption[] = [
    {
        value: 'pending',
        label: 'Pending',
        icon: Circle,
    },
    {
        value: 'in_progress',
        label: 'In Progress',
        icon: Clock,
    },
    {
        value: 'completed',
        label: 'Completed',
        icon: CheckCircle2,
    },
    {
        value: 'cancelled',
        label: 'Cancelled',
        icon: XCircle,
    },
];

// Note: Priority labels are now translated via useTranslations hook
// Use t('tasks.priority_low'), t('tasks.priority_medium'), t('tasks.priority_high')
export const priorities: PriorityOption[] = [
    {
        value: 'low',
        label: 'Low',
        icon: ArrowDown,
    },
    {
        value: 'medium',
        label: 'Medium',
        icon: ArrowRight,
    },
    {
        value: 'high',
        label: 'High',
        icon: ArrowUp,
    },
];

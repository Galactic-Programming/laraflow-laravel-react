import { ActivityList } from '@/components/activity';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Activity } from '@/types/activity';
import { Head } from '@inertiajs/react';
import { ClockAlert, Inbox, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ActivityPageProps {
    activities: Activity[];
    projectId?: number;
    pagination?: Pagination;
}

/**
 * Activity Log Page
 *
 * This page displays a feed of all user activities.
 * Data is provided by the Laravel backend via Inertia.
 */
export default function ActivityPage({
    activities,
    projectId,
    pagination,
}: ActivityPageProps) {
    const { t } = useTranslations();
    const [mounted, setMounted] = useState(false);
    const [showMentionedOnly, setShowMentionedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        if (projectId) {
            return [
                {
                    title: t('nav.projects', 'Projects'),
                    href: '/projects',
                },
                {
                    title: t('nav.activity', 'Activity'),
                    href: `/activity/project/${projectId}`,
                },
            ];
        }

        return [
            {
                title: t('nav.activity', 'Activity'),
                href: '/activity',
            },
        ];
    }, [projectId, t]);

    // Filter activities based on search, type, and mentioned only
    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            // Search filter
            const matchesSearch =
                searchQuery === '' ||
                activity.target
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                activity.user.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                activity.action
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                activity.comment
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType =
                filterType === 'all' || activity.type === filterType;

            // Mentioned only filter
            const matchesMentioned =
                !showMentionedOnly || activity.type === 'mention';

            return matchesSearch && matchesType && matchesMentioned;
        });
    }, [activities, searchQuery, filterType, showMentionedOnly]);

    const activityTypes: { value: string; label: string }[] = [
        { value: 'all', label: t('activity.filter.all', 'All Activities') },
        {
            value: 'created',
            label: t('activity.filter.created', 'Created'),
        },
        {
            value: 'updated',
            label: t('activity.filter.updated', 'Updated'),
        },
        {
            value: 'deleted',
            label: t('activity.filter.deleted', 'Deleted'),
        },
        {
            value: 'status_change',
            label: t('activity.filter.status_change', 'Status Changes'),
        },
        {
            value: 'assignment',
            label: t('activity.filter.assignment', 'Assignments'),
        },
        {
            value: 'comment',
            label: t('activity.filter.comment', 'Comments'),
        },
        {
            value: 'mention',
            label: t('activity.filter.mention', 'Mentions'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('nav.activity', 'Activity Log')} />

            <div
                className={`flex h-full flex-1 flex-col p-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Hero Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-700 ${mounted ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}
                        >
                            <ClockAlert className="size-6" />
                        </div>
                        <div>
                            <h1
                                className={`text-2xl font-bold transition-all delay-100 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t('activity.title', 'Activity Log')}
                            </h1>
                            <p
                                className={`text-sm text-muted-foreground transition-all delay-200 duration-500 ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                            >
                                {t(
                                    'activity.subtitle',
                                    'Track all changes and updates',
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar Section */}
                <div
                    className={`mb-6 flex flex-col gap-4 transition-all delay-300 duration-500 sm:flex-row sm:items-center sm:justify-between ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    <div className="flex flex-1 items-center gap-3">
                        {/* Search Input */}
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t(
                                    'activity.search',
                                    'Search activities...',
                                )}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Type Filter */}
                        <Select
                            value={filterType}
                            onValueChange={setFilterType}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue
                                    placeholder={t(
                                        'activity.filter.type',
                                        'Filter by type',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {activityTypes.map((type) => (
                                    <SelectItem
                                        key={type.value}
                                        value={type.value}
                                    >
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mentioned Only Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {t('activity.mentioned_only', 'Mentions only')}
                        </span>
                        <Switch
                            checked={showMentionedOnly}
                            onCheckedChange={setShowMentionedOnly}
                        />
                    </div>
                </div>

                {/* Activity List Section */}
                <div
                    className={`flex-1 overflow-hidden rounded-xl border bg-card shadow-lg transition-all delay-400 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                    {filteredActivities.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <Empty>
                                <EmptyHeader>
                                    <Inbox className="h-12 w-12 text-muted-foreground" />
                                    <EmptyTitle>
                                        {t(
                                            'activity.empty',
                                            'No activities found',
                                        )}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {t(
                                            'activity.empty_description',
                                            'When there are activities, they will appear here.',
                                        )}
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    ) : (
                        <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-4 md:p-6">
                            <ActivityList activities={filteredActivities} />
                        </div>
                    )}
                </div>

                {/* Pagination Info */}
                {pagination && pagination.last_page > 1 && (
                    <div
                        className={`mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all delay-500 duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        <span>
                            {t('activity.page', 'Page')}{' '}
                            {pagination.current_page} {t('activity.of', 'of')}{' '}
                            {pagination.last_page}
                        </span>
                        <span>•</span>
                        <span>
                            {pagination.total}{' '}
                            {t('activity.total', 'total activities')}
                        </span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

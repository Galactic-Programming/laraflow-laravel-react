import { Table } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/use-translations';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

import { priorities, statuses } from '../data/data.js';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filters?: {
        search?: string;
        status?: string | string[];
        priority?: string | string[];
    };
    onFilterChange?: (filters: Record<string, any>) => void;
    onSortingReset?: () => void;
}

export function DataTableToolbar<TData>({
    table,
    filters = {},
    onFilterChange,
    onSortingReset,
}: DataTableToolbarProps<TData>) {
    const { t } = useTranslations();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState<string[]>(
        Array.isArray(filters.status)
            ? filters.status
            : filters.status
              ? [filters.status]
              : [],
    );
    const [selectedPriority, setSelectedPriority] = useState<string[]>(
        Array.isArray(filters.priority)
            ? filters.priority
            : filters.priority
              ? [filters.priority]
              : [],
    );

    const hasFilters = !!(filters.search || filters.status || filters.priority);
    const hasSorting = table.getState().sorting.length > 0;
    const hasAnyFiltersOrSorting = hasFilters || hasSorting;

    // Sync local state with filters prop when it changes
    useEffect(() => {
        setSearch(filters.search || '');
        setSelectedStatus(
            Array.isArray(filters.status)
                ? filters.status
                : filters.status
                  ? [filters.status]
                  : [],
        );
        setSelectedPriority(
            Array.isArray(filters.priority)
                ? filters.priority
                : filters.priority
                  ? [filters.priority]
                  : [],
        );
    }, [filters.search, filters.status, filters.priority]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onFilterChange && search !== filters.search) {
                onFilterChange({
                    ...filters,
                    search: search || undefined,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleStatusChange = useCallback(
        (values: string[]) => {
            setSelectedStatus(values);
            if (onFilterChange) {
                onFilterChange({
                    ...filters,
                    search,
                    status: values.length > 0 ? values : undefined,
                });
            }
        },
        [filters, search, onFilterChange],
    );

    const handlePriorityChange = useCallback(
        (values: string[]) => {
            setSelectedPriority(values);
            if (onFilterChange) {
                onFilterChange({
                    ...filters,
                    search,
                    priority: values.length > 0 ? values : undefined,
                });
            }
        },
        [filters, search, onFilterChange],
    );

    const handleReset = useCallback(() => {
        setSearch('');
        setSelectedStatus([]);
        setSelectedPriority([]);
        if (onFilterChange) {
            onFilterChange({});
        }
        if (onSortingReset) {
            onSortingReset();
        }
    }, [onFilterChange, onSortingReset]);

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input
                    placeholder={t(
                        'tasks.filter_placeholder',
                        'Lọc công việc...',
                    )}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                <DataTableFacetedFilter
                    title={t('columns.status', 'Trạng thái')}
                    options={statuses}
                    selectedValues={new Set(selectedStatus)}
                    onFilterChange={handleStatusChange}
                />
                <DataTableFacetedFilter
                    title={t('columns.priority', 'Mức độ ưu tiên')}
                    options={priorities}
                    selectedValues={new Set(selectedPriority)}
                    onFilterChange={handlePriorityChange}
                />
                {hasAnyFiltersOrSorting && (
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        {/* Reset
                        <X /> */}
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}

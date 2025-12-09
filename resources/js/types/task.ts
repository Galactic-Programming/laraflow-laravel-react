// Task types from Laravel backend
export interface Task {
    id: number;
    task_list_id: number;
    assigned_to: number | null;
    created_by: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    position: number;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;

    // Relationships
    assignee?: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    creator?: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    task_list?: {
        id: number;
        name: string;
        color: string;
    };
    labels?: Label[];
}

export interface Label {
    id: number;
    name: string;
    color: string;
    description: string | null;
    category: 'Type' | 'Priority' | 'Workflow' | 'Other';
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const TASK_PRIORITIES = {
    low: { label: 'Low', value: 'low', color: '#22c55e' },
    medium: { label: 'Medium', value: 'medium', color: '#f59e0b' },
    high: { label: 'High', value: 'high', color: '#ef4444' },
} as const;

export const TASK_STATUSES = {
    pending: { label: 'Pending', value: 'pending', color: '#a855f7' },
    in_progress: {
        label: 'In Progress',
        value: 'in_progress',
        color: '#3b82f6',
    },
    completed: { label: 'Completed', value: 'completed', color: '#22c55e' },
    cancelled: { label: 'Cancelled', value: 'cancelled', color: '#6b7280' },
} as const;

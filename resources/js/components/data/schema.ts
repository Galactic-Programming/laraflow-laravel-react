import { z } from 'zod';

// Schema for Task from database
export const taskSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    priority: z.enum(['low', 'medium', 'high']),
    label: z.string().optional(), // For compatibility with existing components
    labels: z
        .array(
            z.object({
                id: z.number(),
                name: z.string(),
                color: z.string(),
                description: z.string().nullable(),
                category: z.string(),
            }),
        )
        .optional(),
    due_date: z.string().nullable(),
    position: z.number(),
    task_list_id: z.number(),
    assigned_to: z.number().nullable(),
    created_by: z.number(),
    completed_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

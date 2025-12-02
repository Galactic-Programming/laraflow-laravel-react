import { type Todo } from '@/components/todo-item';
import { type TodoSection } from '@/components/todo-section';

export const sampleTodos: Todo[] = [
    {
        id: '1',
        text: 'Review project requirements',
        completed: false,
        priority: 'important',
        progress: 75,
        comments: 3,
        assignees: [
            {
                id: 'u1',
                name: 'John Doe',
                avatar: 'https://bundui-images.netlify.app/avatars/01.png',
            },
            {
                id: 'u2',
                name: 'Jane Smith',
                avatar: 'https://bundui-images.netlify.app/avatars/02.png',
            },
        ],
    },
    {
        id: '2',
        text: 'Design new landing page',
        completed: false,
        priority: 'new-product',
        progress: 45,
        comments: 5,
        assignees: [
            {
                id: 'u3',
                name: 'Bob Wilson',
                avatar: 'https://bundui-images.netlify.app/avatars/03.png',
            },
        ],
    },
    {
        id: '3',
        text: 'Fix navigation bug',
        completed: true,
        priority: 'delayed',
        progress: 100,
        comments: 2,
        assignees: [
            {
                id: 'u1',
                name: 'John Doe',
                avatar: 'https://bundui-images.netlify.app/avatars/01.png',
            },
        ],
    },
    {
        id: '4',
        text: 'Update documentation',
        completed: false,
        progress: 20,
        comments: 1,
        assignees: [
            {
                id: 'u2',
                name: 'Jane Smith',
                avatar: 'https://bundui-images.netlify.app/avatars/02.png',
            },
            {
                id: 'u3',
                name: 'Bob Wilson',
                avatar: 'https://bundui-images.netlify.app/avatars/03.png',
            },
            {
                id: 'u4',
                name: 'Alice Brown',
                avatar: 'https://bundui-images.netlify.app/avatars/04.png',
            },
        ],
    },
    {
        id: '5',
        text: 'Prepare presentation slides',
        completed: false,
        priority: 'important',
        progress: 60,
        assignees: [
            {
                id: 'u4',
                name: 'Alice Brown',
                avatar: 'https://bundui-images.netlify.app/avatars/04.png',
            },
        ],
    },
];

export const sampleTodoSections: TodoSection[] = [
    {
        id: 'inbox',
        title: 'Inbox',
        icon: '📋',
        todos: [
            {
                id: 't1',
                text: 'Review pull requests',
                completed: false,
                priority: 'important',
                progress: 30,
                comments: 2,
                assignees: [
                    {
                        id: 'u1',
                        name: 'John Doe',
                        avatar: 'https://bundui-images.netlify.app/avatars/01.png',
                    },
                ],
            },
            {
                id: 't2',
                text: 'Update API documentation',
                completed: false,
                progress: 50,
                comments: 1,
                assignees: [
                    {
                        id: 'u2',
                        name: 'Jane Smith',
                        avatar: 'https://bundui-images.netlify.app/avatars/02.png',
                    },
                ],
            },
        ],
    },
    {
        id: 'starred',
        title: 'Starred',
        icon: '⭐',
        todos: [
            {
                id: 't3',
                text: 'Design system update',
                completed: false,
                priority: 'new-product',
                progress: 75,
                comments: 5,
                assignees: [
                    {
                        id: 'u3',
                        name: 'Bob Wilson',
                        avatar: 'https://bundui-images.netlify.app/avatars/03.png',
                    },
                    {
                        id: 'u4',
                        name: 'Alice Brown',
                        avatar: 'https://bundui-images.netlify.app/avatars/04.png',
                    },
                ],
            },
        ],
    },
    {
        id: 'priority',
        title: 'Priority',
        icon: '⚡',
        todos: [
            {
                id: 't4',
                text: 'Fix critical bug in production',
                completed: false,
                priority: 'delayed',
                progress: 80,
                comments: 8,
                assignees: [
                    {
                        id: 'u1',
                        name: 'John Doe',
                        avatar: 'https://bundui-images.netlify.app/avatars/01.png',
                    },
                    {
                        id: 'u2',
                        name: 'Jane Smith',
                        avatar: 'https://bundui-images.netlify.app/avatars/02.png',
                    },
                ],
            },
            {
                id: 't5',
                text: 'Deploy to staging',
                completed: true,
                progress: 100,
                assignees: [
                    {
                        id: 'u3',
                        name: 'Bob Wilson',
                        avatar: 'https://bundui-images.netlify.app/avatars/03.png',
                    },
                ],
            },
        ],
    },
];

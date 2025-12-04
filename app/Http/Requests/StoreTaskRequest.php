<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'task_list_id' => 'required|exists:task_lists,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'due_date' => 'nullable|date|after:today',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'task_list_id.required' => 'Please select a task list.',
            'task_list_id.exists' => 'The selected task list does not exist.',
            'title.required' => 'Task title is required.',
            'title.max' => 'Task title must not exceed 255 characters.',
            'priority.required' => 'Please select a priority level.',
            'priority.in' => 'Invalid priority level.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Invalid status.',
            'due_date.after' => 'Due date must be in the future.',
            'assigned_to.exists' => 'The selected assignee does not exist.',
        ];
    }
}

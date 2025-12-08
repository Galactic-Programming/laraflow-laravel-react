<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Project;

trait AuthorizesProjectOwnership
{
    /**
     * Ensure the authenticated user owns the project.
     *
     * @param Project $project
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    protected function authorizeProjectOwnership(Project $project): void
    {
        if ($project->user_id !== auth()->id()) {
            abort(403);
        }
    }
}

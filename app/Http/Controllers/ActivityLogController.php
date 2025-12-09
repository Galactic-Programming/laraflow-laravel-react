<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display all activities for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $activities = ActivityLog::query()
            ->with('user')
            ->where(function ($query) use ($user) {
                $query->whereHas('project', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                    ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->paginate(50);

        $formattedActivities = $activities->getCollection()
            ->map(fn (ActivityLog $activity) => $activity->toActivityFormat())
            ->all();

        return Inertia::render('activity/index', [
            'activities' => $formattedActivities,
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    /**
     * Display activities for a specific project.
     */
    public function forProject(Request $request, int $projectId): Response
    {
        $user = $request->user();

        $activities = ActivityLog::query()
            ->with('user')
            ->where('project_id', $projectId)
            ->whereHas('project', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->latest()
            ->paginate(50);

        $formattedActivities = $activities->getCollection()
            ->map(fn (ActivityLog $activity) => $activity->toActivityFormat())
            ->all();

        return Inertia::render('activity/index', [
            'activities' => $formattedActivities,
            'projectId' => $projectId,
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    /**
     * Get activities as JSON (for API calls or partial updates).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function list(Request $request)
    {
        $user = $request->user();
        $projectId = $request->input('project_id');
        $type = $request->input('type');
        $limit = $request->input('limit', 20);

        $query = ActivityLog::query()
            ->with('user')
            ->where(function ($q) use ($user) {
                $q->whereHas('project', function ($subQ) use ($user) {
                    $subQ->where('user_id', $user->id);
                })
                    ->orWhere('user_id', $user->id);
            });

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        $activities = $query->latest()
            ->limit($limit)
            ->get()
            ->map(fn (ActivityLog $activity) => $activity->toActivityFormat());

        return response()->json([
            'activities' => $activities,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialConnectionsController extends Controller
{
    /**
     * Show the social connections management page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/connections', [
            'connections' => [
                'google' => $user->hasSocialAccount('google'),
                'github' => $user->hasSocialAccount('github'),
            ],
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Unlink a provider from the current user.
     */
    public function destroy(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'github'], true)) {
            abort(404);
        }

        /** @var SocialAccount|null $account */
        $account = $request->user()->socialAccounts()
            ->where('provider', $provider)
            ->first();

        if ($account !== null) {
            $account->delete();
        }

        return to_route('connections.show')->with('status', __(':provider account unlinked.', ['provider' => ucfirst($provider)]));
    }
}

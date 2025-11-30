<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as ProviderUserContract;
use Laravel\Socialite\Facades\Socialite;

class SocialLinkController extends Controller
{
    /**
     * Redirect the authenticated user to provider to link account.
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        $this->assertAllowedProvider($provider);

        $driver = Socialite::driver($provider);

        if ($provider === 'github') {
            $driver = $driver->scopes(['read:user', 'user:email']);
        }

        // Important: reuse the shared login callback so providers only need one
        // authorized redirect URI (avoids redirect_uri mismatch in settings).
        $callbackUrl = route('social.callback', ['provider' => $provider]);

        return $driver->redirectUrl($callbackUrl)->redirect();
    }

    /**
     * Handle provider callback and link account to current user.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $this->assertAllowedProvider($provider);

        try {
            /** @var ProviderUserContract $providerUser */
            $providerUser = Socialite::driver($provider)->user();
        } catch (\Throwable $e) {
            Log::warning('Social link failed to retrieve user', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return to_route('connections.show')->withErrors([
                'oauth' => __('Unable to link :provider at the moment.', ['provider' => ucfirst($provider)]),
            ]);
        }

        $authUser = $request->user();
        $providerId = (string) $providerUser->getId();

        // Prevent linking if this provider id is already linked to another user
        $conflict = SocialAccount::query()
            ->where('provider', $provider)
            ->where('provider_id', $providerId)
            ->where('user_id', '!=', $authUser->id)
            ->exists();

        if ($conflict) {
            return to_route('connections.show')->withErrors([
                'provider' => __('This :provider account is already linked to another user.', ['provider' => ucfirst($provider)]),
            ]);
        }

        // Upsert for this user + provider
        $account = SocialAccount::query()
            ->firstOrNew([
                'user_id' => $authUser->id,
                'provider' => $provider,
            ]);

        $account->provider_id = $providerId;
        $this->fillTokens($account, $providerUser);
        $account->avatar = $providerUser->getAvatar();
        $account->save();

        // Adopt avatar from provider if user doesn't have one yet
        $this->maybeUpdateUserAvatar($authUser, $providerUser->getAvatar());

        return to_route('connections.show')->with('status', __(':provider account linked.', ['provider' => ucfirst($provider)]));
    }

    protected function assertAllowedProvider(string $provider): void
    {
        if (! in_array($provider, ['google', 'github'], true)) {
            abort(404);
        }
    }

    protected function fillTokens(SocialAccount $account, ProviderUserContract $providerUser): void
    {
        $account->token = $providerUser->token ?? null;
        $account->refresh_token = $providerUser->refreshToken ?? null;
        $expiresIn = $providerUser->expiresIn ?? null;
        $account->expires_at = is_numeric($expiresIn) ? now()->addSeconds((int) $expiresIn) : null;
    }

    protected function maybeUpdateUserAvatar(User $user, ?string $providerAvatar): void
    {
        if ((string) ($user->avatar ?? '') === '') {
            if (is_string($providerAvatar) && $providerAvatar !== '') {
                $user->forceFill(['avatar' => $providerAvatar])->save();
            }
        }
    }
}

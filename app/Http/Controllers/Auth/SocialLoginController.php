<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as ProviderUserContract;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    /**
     * Redirect the user to the OAuth Provider.
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        $this->assertAllowedProvider($provider);

        $driver = Socialite::driver($provider);

        // Request email scope for GitHub to ensure an email is returned
        if ($provider === 'github') {
            $driver = $driver->scopes(['read:user', 'user:email']);
        }

        return $driver->redirect();
    }

    /**
     * Obtain the user information from provider and log them in.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $this->assertAllowedProvider($provider);

        try {
            /** @var ProviderUserContract $providerUser */
            $providerUser = Socialite::driver($provider)->user();
        } catch (\Throwable $e) {
            Log::warning('Social login failed to retrieve user', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('login')->withErrors([
                'oauth' => __('Unable to authenticate with :provider. Please try again.', ['provider' => ucfirst($provider)]),
            ]);
        }

        // If the user is already authenticated, treat this as a linking flow and
        // attach the provider account to the current user. This allows us to
        // reuse the same callback URL for both login and linking.
        if ($request->user() !== null) {
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
            $account = SocialAccount::query()->firstOrNew([
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

        $email = $providerUser->getEmail();
        $providerId = (string) $providerUser->getId();

        if ($email === null || $email === '') {
            return redirect()->route('login')->withErrors([
                'email' => __('Your :provider account does not have a public email. Please allow email access or use another method.', ['provider' => ucfirst($provider)]),
            ]);
        }

        // Find existing social account
        $socialAccount = SocialAccount::query()
            ->where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();

        if ($socialAccount !== null) {
            $this->updateSocialAccountTokens($socialAccount, $providerUser);

            // If the user hasn't set an avatar yet, adopt the provider avatar (do not overwrite existing)
            $this->maybeUpdateUserAvatar($socialAccount->user, $providerUser->getAvatar());

            return $this->loginAndRedirect($socialAccount->user);
        }

        // Link to existing user by email or create a new one
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $name = $providerUser->getName() ?: ($providerUser->getNickname() ?: Str::before($email, '@'));

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                // Random strong password (user can set a new one later)
                'password' => Str::password(32),
            ]);

            // Mark email as verified if provider supplied an email
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        // If the existing user has no avatar yet, set it from provider (only once)
        $this->maybeUpdateUserAvatar($user, $providerUser->getAvatar());

        // Create the social account link
        $socialAccount = new SocialAccount([
            'provider' => $provider,
            'provider_id' => $providerId,
        ]);
        $this->fillTokens($socialAccount, $providerUser);
        $socialAccount->avatar = $providerUser->getAvatar();
        $user->socialAccounts()->save($socialAccount);

        return $this->loginAndRedirect($user);
    }

    protected function assertAllowedProvider(string $provider): void
    {
        if (! in_array($provider, ['google', 'github'], true)) {
            abort(404);
        }
    }

    protected function loginAndRedirect(Authenticatable $user): RedirectResponse
    {
        Auth::login($user);
        $this->regenerateSession();

        return redirect()->intended(route('dashboard'));
    }

    protected function regenerateSession(): void
    {
        request()->session()->regenerate();
    }

    protected function updateSocialAccountTokens(SocialAccount $account, ProviderUserContract $providerUser): void
    {
        $this->fillTokens($account, $providerUser);
        $account->avatar = $providerUser->getAvatar();
        $account->save();
    }

    protected function fillTokens(SocialAccount $account, ProviderUserContract $providerUser): void
    {
        // OAuth2 fields
        $account->token = $providerUser->token ?? null;
        $account->refresh_token = $providerUser->refreshToken ?? null;
        $expiresIn = $providerUser->expiresIn ?? null;
        $account->expires_at = is_numeric($expiresIn) ? now()->addSeconds((int) $expiresIn) : null;
    }

    /**
     * Update the user's avatar from the provider if the user doesn't have one yet.
     */
    protected function maybeUpdateUserAvatar(User $user, ?string $providerAvatar): void
    {
        if ((string) ($user->avatar ?? '') === '') {
            if (is_string($providerAvatar) && $providerAvatar !== '') {
                $user->forceFill(['avatar' => $providerAvatar])->save();
            }
        }
    }
}

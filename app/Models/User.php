<?php

namespace App\Models;

use App\Enums\SubscriptionStatus;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the subscriptions for the user.
     *
     * @return HasMany<Subscription, $this>
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the active subscription for the user (status = active only).
     *
     * @return HasOne<Subscription, $this>
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->latestOfMany();
    }

    /**
     * Get the current valid subscription (active OR cancelled but not expired).
     * This is the subscription that grants access to premium features.
     *
     * @return HasOne<Subscription, $this>
     */
    public function currentSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where(function ($query) {
                // Active subscription OR cancelled but not yet expired
                $query->where('status', SubscriptionStatus::Active->value)
                    ->orWhere(function ($q) {
                        $q->where('status', SubscriptionStatus::Cancelled->value)
                            ->where('ends_at', '>', now());
                    });
            })
            ->latestOfMany();
    }

    /**
     * Get the payments for the user.
     *
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if user has Professional plan access.
     * Returns true even if subscription is cancelled but not yet expired.
     */
    public function isProfessional(): bool
    {
        return $this->currentSubscription?->isProfessional() ?? false;
    }

    /**
     * Check if user has any premium access (not on free plan).
     */
    public function hasPremiumAccess(): bool
    {
        return $this->currentSubscription?->hasAccess() ?? false;
    }

    /**
     * Get the current plan name.
     */
    public function getPlanName(): string
    {
        return $this->currentSubscription?->plan?->name ?? 'Starter';
    }

    /**
     * Get the social accounts for the user.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    /**
     * Get the projects for the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get tasks assigned to the user.
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get tasks created by the user.
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Check if the user has a social account for the given provider.
     */
    public function hasSocialAccount(string $provider): bool
    {
        return $this->socialAccounts()->where('provider', $provider)->exists();
    }

    /**
     * Get the social account for the given provider.
     */
    public function getSocialAccount(string $provider): ?SocialAccount
    {
        return $this->socialAccounts()->where('provider', $provider)->first();
    }
}

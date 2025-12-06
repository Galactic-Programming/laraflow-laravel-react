<?php

namespace App\Http\Controllers;

use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PricingController extends Controller
{
    /**
     * Display the pricing page.
     */
    public function index(Request $request): Response
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price,
                'billing_interval' => $plan->billing_interval->value,
                'features' => $plan->features,
                'stripe_price_id' => $plan->stripe_price_id,
                'is_free' => $plan->isFree(),
                'is_featured' => $plan->is_featured ?? false,
            ]);

        // Get current user's subscription status (includes cancelled but not expired)
        $currentPlan = null;
        $isSubscribed = false;
        $subscription = null;
        $canPurchase = true;

        if ($request->user()) {
            $currentSubscription = $request->user()->currentSubscription;
            if ($currentSubscription && $currentSubscription->hasAccess()) {
                $currentPlan = $currentSubscription->plan?->slug;
                $isSubscribed = true;
                $canPurchase = $currentSubscription->canPurchaseNew();
                $subscription = $this->formatSubscriptionData($currentSubscription);
            }
        }

        return Inertia::render('pricing', [
            'plans' => $plans,
            'currentPlan' => $currentPlan,
            'isSubscribed' => $isSubscribed,
            'canPurchase' => $canPurchase,
            'subscription' => $subscription,
            'stripePaymentLinks' => [
                'professional_monthly' => config('services.stripe.payment_links.professional_monthly'),
                'professional_yearly' => config('services.stripe.payment_links.professional_yearly'),
            ],
        ]);
    }

    /**
     * Show the billing portal or subscription management page.
     */
    public function billing(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->currentSubscription;
        $payments = $user->payments()
            ->with('plan')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('settings/billing', [
            'subscription' => $subscription ? $this->formatSubscriptionData($subscription) : null,
            'payments' => $payments->map(fn ($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status->value,
                'status_label' => $payment->getStatusLabel(),
                'type' => $payment->type->value,
                'type_label' => $payment->getTypeLabel(),
                'plan' => $payment->plan?->name,
                'paid_at' => $payment->paid_at?->format('M d, Y'),
                'invoice_number' => $payment->invoice_number,
            ]),
            'customerPortalUrl' => $this->getValidCustomerPortalUrl(),
            'paymentSuccess' => $request->has('success'),
            'stripePaymentLinks' => [
                'professional_monthly' => config('services.stripe.payment_links.professional_monthly'),
                'professional_yearly' => config('services.stripe.payment_links.professional_yearly'),
            ],
        ]);
    }

    /**
     * Format subscription data for frontend.
     */
    private function formatSubscriptionData(Subscription $subscription): array
    {
        $remainingTime = $subscription->getRemainingTime();

        return [
            'id' => $subscription->id,
            'plan' => $subscription->plan?->name,
            'plan_slug' => $subscription->plan?->slug,
            'billing_interval' => $subscription->plan?->billing_interval->value,
            'price' => $subscription->plan?->price,
            'status' => $subscription->status->value,
            'status_label' => $subscription->getStatusLabel(),
            'status_badge_variant' => $subscription->getStatusBadgeVariant(),
            // Timestamps for countdown
            'starts_at' => $subscription->starts_at?->format('M d, Y'),
            'starts_at_timestamp' => $subscription->starts_at?->timestamp,
            'ends_at' => $subscription->ends_at?->format('M d, Y'),
            'ends_at_timestamp' => $subscription->ends_at?->timestamp,
            'cancelled_at' => $subscription->cancelled_at?->format('M d, Y'),
            // Countdown data
            'remaining_time' => $remainingTime,
            'days_until_expiry' => $subscription->daysUntilExpiry(),
            'is_expiring_soon' => $subscription->isExpiringSoon(),
            'progress_percentage' => $subscription->getProgressPercentage(),
            'remaining_percentage' => $subscription->getRemainingPercentage(),
            'total_duration_days' => $subscription->getTotalDurationDays(),
            // Auto-renewal
            'auto_renew' => $subscription->auto_renew,
            'can_purchase_new' => $subscription->canPurchaseNew(),
            // Status checks
            'is_active' => $subscription->isActive(),
            'is_cancelled' => $subscription->status === SubscriptionStatus::Cancelled,
            'is_cancelled_but_active' => $subscription->isCancelledButActive(),
            'has_access' => $subscription->hasAccess(),
        ];
    }

    /**
     * Get the Stripe Customer Portal URL if properly configured.
     */
    private function getValidCustomerPortalUrl(): ?string
    {
        $url = config('services.stripe.customer_portal_url');

        if (empty($url) || str_contains($url, 'test_xxx') || str_contains($url, 'placeholder')) {
            return null;
        }

        return $url;
    }

    /**
     * Cancel the user's subscription (downgrade to free).
     */
    public function cancelSubscription(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (! $subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        // Ensure ends_at is set (calculate from plan if missing)
        $endsAt = $subscription->ends_at;
        if (! $endsAt) {
            // Calculate end date based on plan's billing interval from starts_at
            $startsAt = $subscription->starts_at ?? now();
            $endsAt = match ($subscription->plan?->billing_interval?->value) {
                'year' => $startsAt->copy()->addYear(),
                default => $startsAt->copy()->addMonth(),
            };
        }

        $subscription->update([
            'status' => SubscriptionStatus::Cancelled,
            'cancelled_at' => now(),
            'ends_at' => $endsAt,
        ]);

        Log::info('Subscription cancelled', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'ends_at' => $endsAt,
        ]);

        return back()->with('success', 'Your subscription has been cancelled. You will have access until '.$endsAt->format('M d, Y').'.');
    }

    /**
     * Resume a cancelled subscription.
     */
    public function resumeSubscription(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', SubscriptionStatus::Cancelled)
            ->whereNotNull('ends_at')
            ->where('ends_at', '>', now())
            ->first();

        if (! $subscription) {
            return back()->with('error', 'No cancelled subscription found to resume.');
        }

        $subscription->update([
            'status' => SubscriptionStatus::Active,
            'cancelled_at' => null,
        ]);

        Log::info('Subscription resumed', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);

        return back()->with('success', 'Your subscription has been resumed.');
    }

    /**
     * Toggle auto-renewal for subscription.
     */
    public function toggleAutoRenew(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = $user->currentSubscription;

        if (! $subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        $newValue = $subscription->toggleAutoRenew();

        Log::info('Auto-renew toggled', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'auto_renew' => $newValue,
        ]);

        $message = $newValue
            ? 'Auto-renewal has been enabled. Your subscription will automatically renew.'
            : 'Auto-renewal has been disabled. Your subscription will not automatically renew.';

        return back()->with('success', $message);
    }

    /**
     * Handle redirect from Stripe after successful payment.
     * This route is public because user session might be lost after Stripe redirect.
     * We redirect to billing page with success flag - if not authenticated,
     * they'll be redirected to login first, then back to billing after login.
     */
    public function paymentSuccess(Request $request): RedirectResponse
    {
        // If user is authenticated, go directly to billing
        if ($request->user()) {
            return redirect()->route('billing.show', ['success' => true]);
        }

        // If not authenticated, redirect to login with intended URL
        // After login, user will be redirected to billing page with success message
        return redirect()->guest(route('login'))
            ->with('status', 'Payment successful! Please log in to view your subscription.')
            ->with('intended', route('billing.show', ['success' => true]));
    }
}

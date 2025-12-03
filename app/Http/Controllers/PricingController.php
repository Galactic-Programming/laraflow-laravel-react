<?php

namespace App\Http\Controllers;

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
            ->map(fn(Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => $plan->price,
                'billing_interval' => $plan->billing_interval,
                'features' => $plan->features,
                'stripe_price_id' => $plan->stripe_price_id,
                'is_free' => $plan->isFree(),
            ]);

        // Get current user's subscription status
        $currentPlan = null;
        $isSubscribed = false;
        $subscription = null;

        if ($request->user()) {
            $activeSubscription = $request->user()->activeSubscription;
            if ($activeSubscription) {
                $currentPlan = $activeSubscription->plan?->slug;
                $isSubscribed = true;
                $subscription = [
                    'id' => $activeSubscription->id,
                    'plan_slug' => $activeSubscription->plan?->slug,
                    'billing_interval' => $activeSubscription->plan?->billing_interval,
                    'ends_at' => $activeSubscription->ends_at?->format('M d, Y'),
                    'ends_at_timestamp' => $activeSubscription->ends_at?->timestamp,
                ];
            }
        }

        return Inertia::render('pricing', [
            'plans' => $plans,
            'currentPlan' => $currentPlan,
            'isSubscribed' => $isSubscribed,
            'subscription' => $subscription,
            'stripePaymentLinks' => [
                // These will be your Stripe Payment Links from the dashboard
                // You'll replace these with actual links after creating them in Stripe
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
        $subscription = $user->activeSubscription;
        $payments = $user->payments()
            ->with('plan')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('settings/billing', [
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'plan' => $subscription->plan?->name,
                'plan_slug' => $subscription->plan?->slug,
                'billing_interval' => $subscription->plan?->billing_interval,
                'price' => $subscription->plan?->price,
                'status' => $subscription->status,
                'starts_at' => $subscription->starts_at?->format('M d, Y'),
                'ends_at' => $subscription->ends_at?->format('M d, Y'),
                'ends_at_timestamp' => $subscription->ends_at?->timestamp,
                'cancelled_at' => $subscription->cancelled_at?->format('M d, Y'),
            ] : null,
            'payments' => $payments->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'plan' => $payment->plan?->name,
                'paid_at' => $payment->paid_at?->format('M d, Y'),
            ]),
            'customerPortalUrl' => config('services.stripe.customer_portal_url'),
            'paymentSuccess' => $request->has('success'),
            'stripePaymentLinks' => [
                'professional_monthly' => config('services.stripe.payment_links.professional_monthly'),
                'professional_yearly' => config('services.stripe.payment_links.professional_yearly'),
            ],
        ]);
    }

    /**
     * Cancel the user's subscription (downgrade to free).
     */
    public function cancelSubscription(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return back()->with('error', 'No active subscription found.');
        }

        // For Stripe Payment Links, we need to cancel via Stripe API
        // For now, we'll just mark it as cancelled locally
        // User will still have access until ends_at date
        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // If using Stripe API to cancel:
        // try {
        //     $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        //     $stripe->subscriptions->cancel($subscription->stripe_subscription_id);
        // } catch (\Exception $e) {
        //     Log::error('Failed to cancel Stripe subscription', ['error' => $e->getMessage()]);
        // }

        Log::info('Subscription cancelled', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);

        return back()->with('success', 'Your subscription has been cancelled. You will have access until ' . $subscription->ends_at?->format('M d, Y') . '.');
    }

    /**
     * Resume a cancelled subscription.
     */
    public function resumeSubscription(Request $request): RedirectResponse
    {
        $user = $request->user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'cancelled')
            ->whereNotNull('ends_at')
            ->where('ends_at', '>', now())
            ->first();

        if (!$subscription) {
            return back()->with('error', 'No cancelled subscription found to resume.');
        }

        $subscription->update([
            'status' => 'active',
            'cancelled_at' => null,
        ]);

        Log::info('Subscription resumed', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);

        return back()->with('success', 'Your subscription has been resumed.');
    }

    /**
     * Handle redirect from Stripe after successful payment.
     * This is a public route that redirects to billing page.
     */
    public function paymentSuccess(Request $request): RedirectResponse
    {
        // Simply redirect to billing page with success flag
        // User will need to login if not authenticated
        return redirect()->route('billing.show', ['success' => true]);
    }
}

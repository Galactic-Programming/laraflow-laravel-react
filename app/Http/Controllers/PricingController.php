<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
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

        if ($request->user()) {
            $activeSubscription = $request->user()->activeSubscription;
            if ($activeSubscription) {
                $currentPlan = $activeSubscription->plan?->slug;
                $isSubscribed = true;
            }
        }

        return Inertia::render('pricing', [
            'plans' => $plans,
            'currentPlan' => $currentPlan,
            'isSubscribed' => $isSubscribed,
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
                'status' => $subscription->status,
                'ends_at' => $subscription->ends_at?->format('M d, Y'),
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
        ]);
    }

    /**
     * Handle redirect from Stripe after successful payment.
     * This is a public route that redirects to billing page.
     */
    public function paymentSuccess(Request $request): \Illuminate\Http\RedirectResponse
    {
        // Simply redirect to billing page with success flag
        // User will need to login if not authenticated
        return redirect()->route('billing.show', ['success' => true]);
    }
}

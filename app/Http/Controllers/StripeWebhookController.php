<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->all();
        $event = $payload['type'] ?? null;

        Log::info('Stripe webhook received', ['event' => $event]);

        match ($event) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($payload['data']['object']),
            'customer.subscription.created' => $this->handleSubscriptionCreated($payload['data']['object']),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($payload['data']['object']),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($payload['data']['object']),
            'invoice.paid' => $this->handleInvoicePaid($payload['data']['object']),
            'invoice.payment_failed' => $this->handleInvoicePaymentFailed($payload['data']['object']),
            default => Log::info('Unhandled Stripe event', ['event' => $event]),
        };

        return response('Webhook handled', 200);
    }

    /**
     * Handle checkout.session.completed event.
     * This is triggered when a customer completes the Payment Link checkout.
     */
    private function handleCheckoutCompleted(array $session): void
    {
        $userId = $session['client_reference_id'] ?? null;

        if (! $userId) {
            Log::warning('Checkout completed without client_reference_id');

            return;
        }

        $user = User::find($userId);

        if (! $user) {
            Log::warning('User not found for checkout', ['user_id' => $userId]);

            return;
        }

        // Get subscription ID from session
        $stripeSubscriptionId = $session['subscription'] ?? null;

        if (! $stripeSubscriptionId) {
            Log::warning('Checkout completed without subscription ID');

            return;
        }

        // Check if this Stripe subscription ID already exists (prevent duplicate webhook processing)
        $existingStripeSubscription = Subscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();
        if ($existingStripeSubscription) {
            Log::info('Subscription already exists for this Stripe subscription ID', [
                'stripe_subscription_id' => $stripeSubscriptionId,
                'existing_subscription_id' => $existingStripeSubscription->id,
            ]);

            return;
        }

        // Check if user already has an active subscription that hasn't expired
        $existingActiveSubscription = $user->currentSubscription;
        if ($existingActiveSubscription && $existingActiveSubscription->hasAccess()) {
            Log::warning('User already has active subscription, rejecting new checkout', [
                'user_id' => $user->id,
                'existing_subscription_id' => $existingActiveSubscription->id,
                'ends_at' => $existingActiveSubscription->ends_at,
            ]);

            // Note: In production, you might want to issue a refund via Stripe API
            // For now, we just log and skip creating a new subscription

            return;
        }

        // Determine the plan based on amount paid
        $amountTotal = ($session['amount_total'] ?? 0) / 100; // Convert from cents
        $plan = $this->determinePlanFromAmount($amountTotal);

        if (! $plan) {
            Log::error('Could not determine plan from amount', [
                'user_id' => $user->id,
                'amount' => $amountTotal,
            ]);

            return;
        }

        // Calculate subscription end date based on plan's billing interval
        $startsAt = now();
        $endsAt = $this->calculateEndDate($startsAt, $plan);

        // Cancel any existing subscription for this user (shouldn't have active ones at this point)
        Subscription::where('user_id', $user->id)
            ->whereIn('status', ['active', 'cancelled'])
            ->update([
                'status' => 'expired',
            ]);

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'stripe_subscription_id' => $stripeSubscriptionId,
            'stripe_customer_id' => $session['customer'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        // Create initial payment record from checkout
        if ($amountTotal > 0) {
            Payment::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'plan_id' => $plan->id,
                'amount' => $amountTotal,
                'currency' => strtoupper($session['currency'] ?? 'USD'),
                'status' => 'completed',
                'payment_method' => 'stripe',
                'stripe_payment_intent_id' => $session['payment_intent'] ?? null,
                'paid_at' => now(),
            ]);

            Log::info('Initial payment recorded from checkout', [
                'user_id' => $user->id,
                'amount' => $amountTotal,
                'plan' => $plan->slug,
            ]);
        }

        Log::info('Subscription created from checkout', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'stripe_subscription_id' => $stripeSubscriptionId,
            'plan' => $plan->slug,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);
    }

    /**
     * Determine the plan based on the payment amount.
     */
    private function determinePlanFromAmount(float $amount): ?Plan
    {
        // Try to find exact match first
        $plan = Plan::where('price', $amount)
            ->where('is_active', true)
            ->first();

        if ($plan) {
            return $plan;
        }

        // Fallback: If amount is >= 50, assume yearly, otherwise monthly
        if ($amount >= 50) {
            return Plan::where('slug', 'professional-yearly')->first();
        }

        return Plan::where('slug', 'professional-monthly')->first();
    }

    /**
     * Calculate subscription end date based on plan's billing interval.
     */
    private function calculateEndDate(\Carbon\Carbon $startsAt, ?Plan $plan): \Carbon\Carbon
    {
        if (! $plan) {
            return $startsAt->copy()->addMonth();
        }

        return match ($plan->billing_interval) {
            'year' => $startsAt->copy()->addYear(),
            'month' => $startsAt->copy()->addMonth(),
            'week' => $startsAt->copy()->addWeek(),
            'day' => $startsAt->copy()->addDay(),
            default => $startsAt->copy()->addMonth(),
        };
    }

    /**
     * Handle customer.subscription.created event.
     */
    private function handleSubscriptionCreated(array $stripeSubscription): void
    {
        Log::info('Processing subscription.created', [
            'stripe_subscription_id' => $stripeSubscription['id'],
            'customer' => $stripeSubscription['customer'] ?? null,
        ]);

        $this->updateSubscriptionFromStripe($stripeSubscription);
    }

    /**
     * Handle customer.subscription.updated event.
     */
    private function handleSubscriptionUpdated(array $stripeSubscription): void
    {
        $this->updateSubscriptionFromStripe($stripeSubscription);
    }

    /**
     * Update local subscription from Stripe subscription data.
     */
    private function updateSubscriptionFromStripe(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();

        if (! $subscription) {
            // Try to find by customer ID if subscription doesn't exist yet
            $subscription = Subscription::where('stripe_customer_id', $stripeSubscription['customer'])
                ->whereNull('stripe_subscription_id')
                ->first();

            if ($subscription) {
                $subscription->stripe_subscription_id = $stripeSubscription['id'];
            }
        }

        if (! $subscription) {
            Log::warning('Subscription not found for update', [
                'stripe_subscription_id' => $stripeSubscription['id'],
            ]);

            return;
        }

        // Map Stripe status to local status
        $status = match ($stripeSubscription['status']) {
            'active', 'trialing' => 'active',
            'canceled' => 'cancelled',
            'past_due' => 'past_due',
            'unpaid' => 'expired',
            default => $stripeSubscription['status'],
        };

        $subscription->update([
            'status' => $status,
            'ends_at' => isset($stripeSubscription['current_period_end'])
                ? now()->setTimestamp($stripeSubscription['current_period_end'])
                : null,
            'cancelled_at' => isset($stripeSubscription['canceled_at']) && $stripeSubscription['canceled_at']
                ? now()->setTimestamp($stripeSubscription['canceled_at'])
                : null,
        ]);

        Log::info('Subscription updated', [
            'subscription_id' => $subscription->id,
            'status' => $status,
        ]);
    }

    /**
     * Handle customer.subscription.deleted event.
     */
    private function handleSubscriptionDeleted(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();

        if (! $subscription) {
            return;
        }

        $subscription->update([
            'status' => 'expired',
            'cancelled_at' => now(),
        ]);

        Log::info('Subscription deleted', ['subscription_id' => $subscription->id]);
    }

    /**
     * Handle invoice.paid event.
     */
    private function handleInvoicePaid(array $invoice): void
    {
        // Check if subscription exists in invoice
        $stripeSubscriptionId = $invoice['subscription'] ?? null;

        if (! $stripeSubscriptionId) {
            Log::info('Invoice paid without subscription (one-time payment)', ['invoice_id' => $invoice['id']]);

            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();

        if (! $subscription) {
            Log::warning('Subscription not found for invoice', ['stripe_subscription_id' => $stripeSubscriptionId]);

            return;
        }

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => ($invoice['amount_paid'] ?? 0) / 100, // Convert from cents
            'currency' => strtoupper($invoice['currency'] ?? 'USD'),
            'status' => 'completed',
            'payment_method' => 'stripe',
            'stripe_payment_intent_id' => $invoice['payment_intent'] ?? null,
            'stripe_invoice_id' => $invoice['id'],
            'paid_at' => now(),
        ]);

        Log::info('Payment recorded', [
            'subscription_id' => $subscription->id,
            'amount' => ($invoice['amount_paid'] ?? 0) / 100,
        ]);
    }

    /**
     * Handle invoice.payment_failed event.
     */
    private function handleInvoicePaymentFailed(array $invoice): void
    {
        $stripeSubscriptionId = $invoice['subscription'] ?? null;

        if (! $stripeSubscriptionId) {
            return;
        }

        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscriptionId)->first();

        if (! $subscription) {
            return;
        }

        $subscription->update(['status' => 'past_due']);

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => ($invoice['amount_due'] ?? 0) / 100,
            'currency' => strtoupper($invoice['currency'] ?? 'USD'),
            'status' => 'failed',
            'payment_method' => 'stripe',
            'stripe_invoice_id' => $invoice['id'],
        ]);

        Log::warning('Payment failed', ['subscription_id' => $subscription->id]);
    }
}

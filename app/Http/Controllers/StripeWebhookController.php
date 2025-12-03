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

        // Find plan by Stripe Price ID
        $stripePriceId = $session['line_items']['data'][0]['price']['id'] ?? null;
        $plan = $stripePriceId ? Plan::where('stripe_price_id', $stripePriceId)->first() : null;

        // Create or update subscription
        $subscription = Subscription::updateOrCreate(
            ['stripe_subscription_id' => $session['subscription']],
            [
                'user_id' => $user->id,
                'plan_id' => $plan?->id,
                'status' => 'active',
                'stripe_customer_id' => $session['customer'],
                'starts_at' => now(),
            ]
        );

        Log::info('Subscription created from checkout', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Handle customer.subscription.created event.
     */
    private function handleSubscriptionCreated(array $stripeSubscription): void
    {
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
            'cancelled_at' => $stripeSubscription['canceled_at']
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
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();

        if (! $subscription) {
            return;
        }

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => $invoice['amount_paid'] / 100, // Convert from cents
            'currency' => strtoupper($invoice['currency']),
            'status' => 'completed',
            'payment_method' => 'stripe',
            'stripe_payment_intent_id' => $invoice['payment_intent'],
            'stripe_invoice_id' => $invoice['id'],
            'paid_at' => now(),
        ]);

        Log::info('Payment recorded', [
            'subscription_id' => $subscription->id,
            'amount' => $invoice['amount_paid'] / 100,
        ]);
    }

    /**
     * Handle invoice.payment_failed event.
     */
    private function handleInvoicePaymentFailed(array $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();

        if (! $subscription) {
            return;
        }

        $subscription->update(['status' => 'past_due']);

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => $invoice['amount_due'] / 100,
            'currency' => strtoupper($invoice['currency']),
            'status' => 'failed',
            'payment_method' => 'stripe',
            'stripe_invoice_id' => $invoice['id'],
        ]);

        Log::warning('Payment failed', ['subscription_id' => $subscription->id]);
    }
}

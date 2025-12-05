<?php

namespace App\Http\Controllers;

use App\Enums\BillingInterval;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\SubscriptionStatus;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Handle Stripe webhook events.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        // Verify webhook signature if secret is configured
        if ($secret) {
            try {
                $event = Webhook::constructEvent($payload, $sigHeader, $secret);
                $eventType = $event->type;
                $eventData = $event->data->object->toArray();
            } catch (SignatureVerificationException $e) {
                Log::warning('Invalid Stripe webhook signature', ['error' => $e->getMessage()]);

                return response('Invalid signature', 400);
            } catch (\Exception $e) {
                Log::error('Stripe webhook error', ['error' => $e->getMessage()]);

                return response('Webhook error', 400);
            }
        } else {
            // Fallback for local development without signature verification
            $data = json_decode($payload, true);
            $eventType = $data['type'] ?? null;
            $eventData = $data['data']['object'] ?? [];
            Log::warning('Stripe webhook received without signature verification (development mode)');
        }

        Log::info('Stripe webhook received', ['event' => $eventType]);

        match ($eventType) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($eventData),
            'customer.subscription.created' => $this->handleSubscriptionCreated($eventData),
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($eventData),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($eventData),
            'invoice.paid' => $this->handleInvoicePaid($eventData),
            'invoice.payment_failed' => $this->handleInvoicePaymentFailed($eventData),
            default => Log::info('Unhandled Stripe event', ['event' => $eventType]),
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

        // Determine the plan (try Price ID first, then amount-based fallback)
        $amountTotal = ($session['amount_total'] ?? 0) / 100; // Convert from cents
        $plan = $this->determinePlan($session);

        if (! $plan) {
            Log::error('Could not determine plan from session', [
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
            ->whereIn('status', [SubscriptionStatus::Active->value, SubscriptionStatus::Cancelled->value])
            ->update([
                'status' => SubscriptionStatus::Expired,
            ]);

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => SubscriptionStatus::Active,
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
                'status' => PaymentStatus::Completed,
                'type' => PaymentType::Initial,
                'payment_method' => 'stripe',
                'stripe_payment_intent_id' => $session['payment_intent'] ?? null,
                'invoice_number' => Payment::generateInvoiceNumber(),
                'billing_period_start' => $startsAt,
                'billing_period_end' => $endsAt,
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
     * Determine the plan from checkout session.
     * First tries to match by Stripe Price ID, then falls back to amount-based detection.
     */
    private function determinePlan(array $session): ?Plan
    {
        // Try to get price ID from line items
        $lineItems = $session['line_items']['data'] ?? [];

        foreach ($lineItems as $item) {
            $priceId = $item['price']['id'] ?? null;
            if ($priceId) {
                $plan = Plan::where('stripe_price_id', $priceId)
                    ->where('is_active', true)
                    ->first();
                if ($plan) {
                    Log::info('Plan determined by Stripe Price ID', ['price_id' => $priceId, 'plan' => $plan->slug]);

                    return $plan;
                }
            }
        }

        // Fallback to amount-based detection
        $amountTotal = ($session['amount_total'] ?? 0) / 100;

        return $this->determinePlanFromAmount($amountTotal);
    }

    /**
     * Determine the plan based on the payment amount (fallback method).
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
            BillingInterval::Year => $startsAt->copy()->addYear(),
            BillingInterval::Month => $startsAt->copy()->addMonth(),
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
            'active', 'trialing' => SubscriptionStatus::Active,
            'canceled' => SubscriptionStatus::Cancelled,
            'past_due' => SubscriptionStatus::PastDue,
            'unpaid' => SubscriptionStatus::Expired,
            default => SubscriptionStatus::tryFrom($stripeSubscription['status']) ?? SubscriptionStatus::Expired,
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
            'status' => SubscriptionStatus::Expired,
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

        // Check if this is a renewal payment (payment already exists for this subscription)
        $isRenewal = Payment::where('subscription_id', $subscription->id)->exists();

        // Calculate billing period from invoice timestamps
        $billingPeriodStart = isset($invoice['period_start'])
            ? now()->setTimestamp($invoice['period_start'])
            : $subscription->starts_at;
        $billingPeriodEnd = isset($invoice['period_end'])
            ? now()->setTimestamp($invoice['period_end'])
            : $subscription->ends_at;

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => ($invoice['amount_paid'] ?? 0) / 100, // Convert from cents
            'currency' => strtoupper($invoice['currency'] ?? 'USD'),
            'status' => PaymentStatus::Completed,
            'type' => $isRenewal ? PaymentType::Renewal : PaymentType::Initial,
            'payment_method' => 'stripe',
            'stripe_payment_intent_id' => $invoice['payment_intent'] ?? null,
            'stripe_invoice_id' => $invoice['id'],
            'invoice_number' => Payment::generateInvoiceNumber(),
            'billing_period_start' => $billingPeriodStart,
            'billing_period_end' => $billingPeriodEnd,
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

        $subscription->update(['status' => SubscriptionStatus::PastDue]);

        // Activate grace period (3 days to update payment method)
        $subscription->setGracePeriod(3);

        // Calculate billing period from invoice timestamps
        $billingPeriodStart = isset($invoice['period_start'])
            ? now()->setTimestamp($invoice['period_start'])
            : $subscription->starts_at;
        $billingPeriodEnd = isset($invoice['period_end'])
            ? now()->setTimestamp($invoice['period_end'])
            : $subscription->ends_at;

        Payment::create([
            'user_id' => $subscription->user_id,
            'subscription_id' => $subscription->id,
            'plan_id' => $subscription->plan_id,
            'amount' => ($invoice['amount_due'] ?? 0) / 100,
            'currency' => strtoupper($invoice['currency'] ?? 'USD'),
            'status' => PaymentStatus::Failed,
            'type' => PaymentType::Renewal,
            'payment_method' => 'stripe',
            'stripe_invoice_id' => $invoice['id'],
            'invoice_number' => Payment::generateInvoiceNumber(),
            'billing_period_start' => $billingPeriodStart,
            'billing_period_end' => $billingPeriodEnd,
            'failure_message' => $invoice['last_finalization_error']['message'] ?? 'Payment failed',
        ]);

        Log::warning('Payment failed, grace period activated', [
            'subscription_id' => $subscription->id,
            'grace_period_ends_at' => $subscription->grace_period_ends_at,
        ]);
    }
}

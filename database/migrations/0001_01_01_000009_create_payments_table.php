<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();

            // Payment details
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->enum('type', ['initial', 'renewal', 'upgrade'])->default('initial');

            // Billing period this payment covers
            $table->timestamp('billing_period_start')->nullable();
            $table->timestamp('billing_period_end')->nullable();

            // Payment method info
            $table->string('payment_method', 50)->nullable(); // stripe, paypal, etc.
            $table->string('payment_method_type', 50)->nullable(); // card, bank_transfer, etc.
            $table->string('card_last_four', 4)->nullable(); // Last 4 digits of card
            $table->string('card_brand', 20)->nullable(); // visa, mastercard, etc.

            // Stripe integration
            $table->string('stripe_payment_intent_id')->nullable()->unique();
            $table->string('stripe_invoice_id')->nullable()->unique();
            $table->string('stripe_charge_id')->nullable()->unique();

            // Invoice
            $table->string('invoice_number', 50)->nullable()->unique();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Failure tracking
            $table->string('failure_code')->nullable();
            $table->text('failure_message')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']); // For payment history
            $table->index(['type', 'status']);
            $table->index(['subscription_id', 'type']); // For subscription payments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

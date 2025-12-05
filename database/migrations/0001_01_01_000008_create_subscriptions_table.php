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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();

            // Subscription status
            $table->enum('status', ['active', 'cancelled', 'expired', 'past_due'])->default('active');

            // Stripe integration
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('stripe_customer_id')->nullable()->index();

            // Subscription period
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable(); // Why user cancelled

            // Auto-renewal settings
            $table->boolean('auto_renew')->default(true);
            $table->timestamp('renewal_notified_at')->nullable(); // Last notification sent
            $table->unsignedTinyInteger('renewal_notification_count')->default(0); // How many notifications sent

            // Grace period (calculated from ends_at + grace_days, stored for query efficiency)
            $table->timestamp('grace_period_ends_at')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index(['user_id', 'status']);
            $table->index(['status', 'ends_at']); // For expiring subscriptions query
            $table->index(['auto_renew', 'ends_at']); // For scheduled renewal checks
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

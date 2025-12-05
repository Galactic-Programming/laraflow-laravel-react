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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Display name: "Professional"
            $table->string('slug')->unique(); // Unique identifier: "professional-monthly"
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_interval', ['month', 'year'])->default('month');
            $table->unsignedInteger('interval_count')->default(1); // Number of intervals (e.g., 1 month, 3 months)
            $table->json('features')->nullable(); // List of features included
            $table->string('stripe_price_id')->nullable()->index(); // Stripe Price ID for API calls
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false); // Highlight this plan
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};

# 📋 Kế hoạch Refactor Billing Feature

## Tổng quan

Sau khi phân tích toàn diện các migrations, enums, models, controllers và frontend liên quan đến Billing feature, đây là kế hoạch chi tiết để fix các vấn đề và hoàn thiện tính năng.

---

## 🔴 Critical - Cần Fix Ngay

### 1. StripeWebhookController.php - Status Mapping (Lines 193-198)

**Vấn đề:** Dùng hardcoded strings thay vì Enum

```php
// ❌ Current (sai):
$status = match ($stripeSubscription['status']) {
    'active', 'trialing' => 'active',
    'canceled' => 'cancelled',
    'past_due' => 'past_due',
    'unpaid' => 'expired',
    default => $stripeSubscription['status'],
};

// ✅ Should be:
$status = match ($stripeSubscription['status']) {
    'active', 'trialing' => SubscriptionStatus::Active,
    'canceled' => SubscriptionStatus::Cancelled,
    'past_due' => SubscriptionStatus::PastDue,
    'unpaid' => SubscriptionStatus::Expired,
    default => SubscriptionStatus::tryFrom($stripeSubscription['status']) ?? SubscriptionStatus::Expired,
};
```

### 2. StripeWebhookController.php - calculateEndDate() (Lines 183-189)

**Vấn đề:** Dùng string comparison thay vì Enum

```php
// ❌ Current (sai):
return match ($plan->billing_interval) {
    'year' => $startsAt->copy()->addYear(),
    'month' => $startsAt->copy()->addMonth(),
    'week' => $startsAt->copy()->addWeek(),
    'day' => $startsAt->copy()->addDay(),
    default => $startsAt->copy()->addMonth(),
};

// ✅ Should be:
return match ($plan->billing_interval) {
    BillingInterval::Year => $startsAt->copy()->addYear(),
    BillingInterval::Month => $startsAt->copy()->addMonth(),
    default => $startsAt->copy()->addMonth(),
};
```

**Lưu ý:** `week` và `day` không có trong BillingInterval enum nên không cần.

---

## 🟡 Medium Priority - Thiếu Tính Năng

### 3. Payment Type Không Đúng

**Vấn đề:** Tất cả payments đều được tạo với type `initial` (default), kể cả khi là renewal.

**File:** `StripeWebhookController.php`

**Fix:**

- Trong `handleCheckoutCompleted()`: Set `type => PaymentType::Initial`
- Trong `handleInvoicePaid()`: Check nếu là renewal payment thì set `type => PaymentType::Renewal`

```php
// Trong handleInvoicePaid():
$isRenewal = Payment::where('subscription_id', $subscription->id)->exists();

Payment::create([
    // ...
    'type' => $isRenewal ? PaymentType::Renewal : PaymentType::Initial,
]);
```

### 4. Missing invoice_number

**Vấn đề:** Payments không có invoice number được generate.

**Fix:** Sử dụng method `generateInvoiceNumber()` đã có trong Payment model:

```php
Payment::create([
    // ...
    'invoice_number' => Payment::generateInvoiceNumber(),
]);
```

### 5. Missing billing_period_start/end

**Vấn đề:** Không track billing period cho payments.

**Fix:** Populate từ subscription hoặc Stripe invoice data:

```php
Payment::create([
    // ...
    'billing_period_start' => $subscription->starts_at,
    'billing_period_end' => $subscription->ends_at,
]);
```

---

## 🟢 Low Priority - Factories cho Testing

### 6. Tạo PlanFactory

```php
// database/factories/PlanFactory.php
public function definition(): array
{
    return [
        'name' => fake()->randomElement(['Starter', 'Professional', 'Enterprise']),
        'slug' => fn (array $attributes) => Str::slug($attributes['name']) . '-' . fake()->randomElement(['monthly', 'yearly']),
        'description' => fake()->sentence(),
        'price' => fake()->randomFloat(2, 0, 99),
        'billing_interval' => fake()->randomElement(BillingInterval::cases()),
        'interval_count' => 1,
        'features' => fake()->sentences(5),
        'is_active' => true,
        'is_featured' => fake()->boolean(30),
        'sort_order' => fake()->numberBetween(1, 10),
    ];
}
```

### 7. Tạo SubscriptionFactory

```php
// database/factories/SubscriptionFactory.php
public function definition(): array
{
    $startsAt = fake()->dateTimeBetween('-1 month', 'now');

    return [
        'user_id' => User::factory(),
        'plan_id' => Plan::factory(),
        'status' => SubscriptionStatus::Active,
        'starts_at' => $startsAt,
        'ends_at' => Carbon::parse($startsAt)->addMonth(),
        'auto_renew' => true,
    ];
}

// States
public function cancelled(): static
{
    return $this->state(fn () => [
        'status' => SubscriptionStatus::Cancelled,
        'cancelled_at' => now(),
    ]);
}

public function expired(): static
{
    return $this->state(fn () => [
        'status' => SubscriptionStatus::Expired,
        'ends_at' => now()->subDay(),
    ]);
}
```

### 8. Tạo PaymentFactory

```php
// database/factories/PaymentFactory.php
public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'subscription_id' => Subscription::factory(),
        'plan_id' => Plan::factory(),
        'amount' => fake()->randomFloat(2, 9.99, 99.00),
        'currency' => 'USD',
        'status' => PaymentStatus::Completed,
        'type' => PaymentType::Initial,
        'payment_method' => 'stripe',
        'invoice_number' => fn () => Payment::generateInvoiceNumber(),
        'paid_at' => now(),
    ];
}

// States
public function pending(): static
{
    return $this->state(fn () => [
        'status' => PaymentStatus::Pending,
        'paid_at' => null,
    ]);
}

public function failed(): static
{
    return $this->state(fn () => [
        'status' => PaymentStatus::Failed,
        'failure_message' => 'Card declined',
    ]);
}
```

---

## ✅ Đã OK - Không Cần Thay Đổi

| Component                    | Status | Notes                          |
| ---------------------------- | ------ | ------------------------------ |
| `Plan.php` model             | ✅     | $fillable và casts đúng        |
| `Subscription.php` model     | ✅     | $fillable, casts, methods đúng |
| `Payment.php` model          | ✅     | $fillable, casts, methods đúng |
| `User.php` model             | ✅     | Đã fix dùng Enum               |
| `PricingController.php`      | ✅     | Tất cả dùng Enum               |
| `billing.tsx` frontend       | ✅     | Interface và UI đúng           |
| `pricing.tsx` frontend       | ✅     | Logic disable đúng             |
| `subscription-countdown.tsx` | ✅     | Hoạt động tốt                  |
| `use-countdown.ts` hook      | ✅     | Hoạt động tốt                  |
| All Enums                    | ✅     | Match với migrations           |

---

## 📝 Checklist Thực Hiện

- [ ] Fix StripeWebhookController status mapping (Critical)
- [ ] Fix StripeWebhookController calculateEndDate (Critical)
- [ ] Add PaymentType logic for renewal vs initial (Medium)
- [ ] Generate invoice_number for payments (Medium)
- [ ] Populate billing_period_start/end (Medium)
- [ ] Create PlanFactory (Low)
- [ ] Create SubscriptionFactory (Low)
- [ ] Create PaymentFactory (Low)
- [ ] Run tests to verify all changes
- [ ] Run `vendor/bin/pint --dirty` to format code

---

## 🧪 Testing After Changes

```bash
# Run all billing tests
php artisan test --filter=Billing

# Run full test suite
php artisan test
```

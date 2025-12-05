# 📋 Kế hoạch Hoàn thiện Billing Feature

## Tổng quan

Billing feature hiện đạt ~75% hoàn thành. Cần bổ sung các phần sau để production-ready.

---

## 🔴 Ưu tiên CAO - Bảo mật & Core

### 1. Webhook Signature Verification

**Vấn đề:** `StripeWebhookController` không xác thực chữ ký webhook từ Stripe - lỗ hổng bảo mật nghiêm trọng.

**File:** `app/Http/Controllers/StripeWebhookController.php`

**Cần thêm:**

```php
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

public function handle(Request $request): Response
{
    $payload = $request->getContent();
    $sigHeader = $request->header('Stripe-Signature');
    $secret = config('services.stripe.webhook_secret');

    try {
        $event = Webhook::constructEvent($payload, $sigHeader, $secret);
    } catch (SignatureVerificationException $e) {
        Log::warning('Invalid Stripe webhook signature', ['error' => $e->getMessage()]);
        return response('Invalid signature', 400);
    }

    // ... rest of handling using $event->type and $event->data->object
}
```

**Cần thêm config:**

```php
// config/services.php
'stripe' => [
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],
```

---

### 2. Renewal Notification System

**Vấn đề:** Có logic `shouldSendRenewalNotification()` nhưng thiếu:

- Notification class
- Scheduled command
- Email template

**Files cần tạo:**

#### 2.1. Notification Class

```bash
php artisan make:notification SubscriptionRenewalNotification
```

```php
// app/Notifications/SubscriptionRenewalNotification.php
namespace App\Notifications;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionRenewalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Subscription $subscription,
        public int $daysUntilExpiry
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $planName = $this->subscription->plan->name;

        return (new MailMessage)
            ->subject("Your {$planName} subscription expires in {$this->daysUntilExpiry} days")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Your {$planName} subscription will expire in {$this->daysUntilExpiry} days.")
            ->when($this->subscription->auto_renew, function ($message) {
                return $message->line('Your subscription will automatically renew. No action needed.');
            })
            ->when(!$this->subscription->auto_renew, function ($message) {
                return $message
                    ->line('Auto-renewal is disabled. Please renew manually to continue your subscription.')
                    ->action('Manage Subscription', url('/settings/billing'));
            })
            ->line('Thank you for being a valued customer!');
    }
}
```

#### 2.2. Scheduled Command

```bash
php artisan make:command SendRenewalNotifications
```

```php
// app/Console/Commands/SendRenewalNotifications.php
namespace App\Console\Commands;

use App\Models\Subscription;
use App\Notifications\SubscriptionRenewalNotification;
use Illuminate\Console\Command;

class SendRenewalNotifications extends Command
{
    protected $signature = 'subscriptions:send-renewal-notifications';
    protected $description = 'Send renewal notifications to users with expiring subscriptions';

    public function handle(): int
    {
        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->where('status', 'active')
            ->whereNotNull('ends_at')
            ->get();

        $sent = 0;

        foreach ($subscriptions as $subscription) {
            if ($subscription->shouldSendRenewalNotification()) {
                $daysUntilExpiry = now()->diffInDays($subscription->ends_at);

                $subscription->user->notify(
                    new SubscriptionRenewalNotification($subscription, $daysUntilExpiry)
                );

                $subscription->markRenewalNotificationSent();
                $sent++;
            }
        }

        $this->info("Sent {$sent} renewal notifications.");

        return Command::SUCCESS;
    }
}
```

#### 2.3. Schedule Command

```php
// routes/console.php (hoặc app/Console/Kernel.php nếu có)
use Illuminate\Support\Facades\Schedule;

Schedule::command('subscriptions:send-renewal-notifications')->dailyAt('09:00');
```

---

## 🟡 Ưu tiên TRUNG BÌNH - Reliability

### 3. Grace Period Activation

**Vấn đề:** Field `grace_period_ends_at` tồn tại nhưng không được sử dụng.

**File:** `app/Http/Controllers/StripeWebhookController.php`

**Cần thêm vào `handleInvoicePaymentFailed()`:**

```php
private function handleInvoicePaymentFailed(array $invoice): void
{
    // ... existing code ...

    $subscription->update(['status' => SubscriptionStatus::PastDue]);

    // Activate grace period (3 days to update payment method)
    $subscription->setGracePeriod(3);

    // ... rest of code ...
}
```

---

### 4. Improve Plan Detection (Sử dụng Stripe Price ID)

**Vấn đề:** `determinePlanFromAmount()` dùng số tiền để xác định plan - không đáng tin cậy.

**Giải pháp:** Thêm `stripe_price_id` vào Plan model và sử dụng trong webhook.

#### 4.1. Migration

```bash
php artisan make:migration add_stripe_price_id_to_plans_table
```

```php
Schema::table('plans', function (Blueprint $table) {
    $table->string('stripe_price_id')->nullable()->after('price');
});
```

#### 4.2. Update Plan Model

```php
protected $fillable = [
    // ... existing
    'stripe_price_id',
];
```

#### 4.3. Update PlanSeeder

```php
Plan::updateOrCreate(
    ['slug' => 'professional-monthly'],
    [
        'stripe_price_id' => env('STRIPE_MONTHLY_PRICE_ID'),
        // ... other fields
    ]
);
```

#### 4.4. Update Webhook Controller

```php
private function determinePlan(array $session): ?Plan
{
    // Try to get price ID from line items
    $lineItems = $session['line_items']['data'] ?? [];

    foreach ($lineItems as $item) {
        $priceId = $item['price']['id'] ?? null;
        if ($priceId) {
            $plan = Plan::where('stripe_price_id', $priceId)->first();
            if ($plan) {
                return $plan;
            }
        }
    }

    // Fallback to amount-based detection
    return $this->determinePlanFromAmount(($session['amount_total'] ?? 0) / 100);
}
```

---

### 5. Expire Past Due Subscriptions

**Cần tạo command tự động expire subscription quá hạn:**

```php
// app/Console/Commands/ExpirePastDueSubscriptions.php
namespace App\Console\Commands;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use Illuminate\Console\Command;

class ExpirePastDueSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire-past-due';
    protected $description = 'Expire subscriptions that are past due and grace period has ended';

    public function handle(): int
    {
        $expired = Subscription::query()
            ->where('status', SubscriptionStatus::PastDue)
            ->where(function ($query) {
                $query->whereNull('grace_period_ends_at')
                    ->orWhere('grace_period_ends_at', '<', now());
            })
            ->update(['status' => SubscriptionStatus::Expired]);

        $this->info("Expired {$expired} past-due subscriptions.");

        return Command::SUCCESS;
    }
}
```

```php
// routes/console.php
Schedule::command('subscriptions:expire-past-due')->hourly();
```

---

## 🟢 Ưu tiên THẤP - Enhancement

### 6. Billing Event Email Templates

**Notifications cần tạo:**

| Notification                        | Trigger                        |
| ----------------------------------- | ------------------------------ |
| `SubscriptionActivatedNotification` | Sau checkout.session.completed |
| `PaymentSuccessNotification`        | Sau invoice.paid               |
| `PaymentFailedNotification`         | Sau invoice.payment_failed     |
| `SubscriptionExpiredNotification`   | Khi subscription expire        |

### 7. Additional Tests

**Test cases cần thêm:**

```php
// tests/Feature/StripeWebhookTest.php
it('verifies webhook signature');
it('handles checkout.session.completed event');
it('handles invoice.paid event');
it('handles invoice.payment_failed event');
it('rejects duplicate subscription from webhook');
it('sets grace period on payment failure');

// tests/Feature/Settings/BillingTest.php (bổ sung)
it('can toggle auto renew');
it('shows correct countdown for different subscription states');
it('grace period extends access');
```

---

## ✅ Checklist Thực hiện

### Phase 1 - Security (Ngay lập tức)

- [ ] Add `STRIPE_WEBHOOK_SECRET` to `.env.example`
- [ ] Add `stripe.webhook_secret` to `config/services.php`
- [ ] Implement webhook signature verification
- [ ] Test webhook with Stripe CLI

### Phase 2 - Notifications (Tuần này)

- [ ] Create `SubscriptionRenewalNotification`
- [ ] Create `SendRenewalNotifications` command
- [ ] Add to schedule in `routes/console.php`
- [ ] Test notification sending

### Phase 3 - Reliability (Tuần sau)

- [ ] Implement grace period activation
- [ ] Create `ExpirePastDueSubscriptions` command
- [ ] Add `stripe_price_id` to plans
- [ ] Update webhook to use Price ID

### Phase 4 - Enhancement (Tùy chọn)

- [ ] Create billing event notifications
- [ ] Add comprehensive webhook tests
- [ ] Create invoice download feature

---

## 🧪 Testing Commands

```bash
# Test renewal notifications
php artisan subscriptions:send-renewal-notifications

# Test expiring past due
php artisan subscriptions:expire-past-due

# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:8000/stripe/webhook
stripe trigger checkout.session.completed
```

---

## 📊 Sau khi hoàn thành

| Metric                 | Hiện tại | Mục tiêu |
| ---------------------- | -------- | -------- |
| Requirements completed | 5/6      | 6/6      |
| Security score         | 60%      | 100%     |
| Test coverage          | 60%      | 85%+     |
| Overall completion     | 75%      | 95%+     |

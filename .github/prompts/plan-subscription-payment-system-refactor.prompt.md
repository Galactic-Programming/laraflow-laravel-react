# Subscription Payment System Refactor Plan

## 🏗️ Kiến trúc Subscription Payment System Chuẩn

### Tổng quan Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUBSCRIPTION LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │  FREE    │───▶│ CHECKOUT │───▶│  ACTIVE  │───▶│ RENEWING │───▶│RENEWED ││
│  │  USER    │    │  FLOW    │    │          │    │          │    │        ││
│  └──────────┘    └──────────┘    └────┬─────┘    └──────────┘    └────────┘│
│                                       │                                     │
│                                       ▼                                     │
│                                 ┌──────────┐                                │
│                                 │ CANCELLED│──────┐                         │
│                                 │(has access)     │                         │
│                                 └─────┬────┘      │                         │
│                                       │           ▼                         │
│                                       │     ┌──────────┐                    │
│                                       │     │  RESUME  │                    │
│                                       │     └──────────┘                    │
│                                       ▼                                     │
│                                 ┌──────────┐    ┌──────────┐                │
│                                 │ EXPIRED  │───▶│  RE-SUB  │                │
│                                 │(no access)    │          │                │
│                                 └──────────┘    └──────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Các Giai đoạn Chi tiết

### **Phase 1: Pre-Purchase (Trước khi mua)**

| Bước | Mô tả                   | Cần có                                     |
| ---- | ----------------------- | ------------------------------------------ |
| 1.1  | Hiển thị Pricing Page   | Plans với features, giá                    |
| 1.2  | So sánh plans           | Feature comparison table                   |
| 1.3  | Xác định eligibility    | User có thể mua không? (đã có sub active?) |
| 1.4  | Áp dụng coupon/discount | Validate coupon code                       |

```
Database State: User chưa có subscription hoặc subscription đã expired
```

---

### **Phase 2: Checkout (Thanh toán)**

| Bước | Mô tả                       | Stripe Event                    |
| ---- | --------------------------- | ------------------------------- |
| 2.1  | User chọn plan              | -                               |
| 2.2  | Redirect to Stripe Checkout | `checkout.session.created`      |
| 2.3  | User nhập payment info      | -                               |
| 2.4  | Stripe validate card        | -                               |
| 2.5  | Payment processed           | `payment_intent.succeeded`      |
| 2.6  | Checkout completed          | `checkout.session.completed` ⭐ |
| 2.7  | Invoice created & paid      | `invoice.paid`                  |

```
Database State AFTER checkout.session.completed:
┌─────────────────────────────────────────────────────────┐
│ subscriptions                                           │
├─────────────────────────────────────────────────────────┤
│ user_id: 1                                              │
│ plan_id: 2 (Professional Monthly)                       │
│ status: 'active'                                        │
│ starts_at: 2025-12-06 10:00:00                          │
│ ends_at: 2026-01-06 10:00:00                            │
│ auto_renew: true                                        │
│ stripe_subscription_id: 'sub_xxx'                       │
│ stripe_customer_id: 'cus_xxx'                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ payments                                                │
├─────────────────────────────────────────────────────────┤
│ user_id: 1                                              │
│ subscription_id: 1                                      │
│ plan_id: 2                                              │
│ amount: 9.99                                            │
│ status: 'completed'                                     │
│ type: 'initial'                                         │
│ billing_period_start: 2025-12-06                        │
│ billing_period_end: 2026-01-06                          │
│ stripe_invoice_id: 'in_xxx'                             │
│ paid_at: 2025-12-06 10:00:00                            │
└─────────────────────────────────────────────────────────┘
```

---

### **Phase 3: Active Subscription (Đang sử dụng)**

| Bước | Mô tả                          | Trigger                        |
| ---- | ------------------------------ | ------------------------------ |
| 3.1  | User sử dụng Pro features      | Middleware check `hasAccess()` |
| 3.2  | Hiển thị subscription info     | Billing page                   |
| 3.3  | Countdown thời gian còn lại    | Real-time UI                   |
| 3.4  | Gửi reminder trước khi hết hạn | Scheduled job (7, 3, 1 ngày)   |

```php
// Middleware để protect Pro features
public function handle($request, Closure $next)
{
    $subscription = $request->user()->currentSubscription();

    if (!$subscription || !$subscription->hasAccess()) {
        return redirect()->route('pricing')
            ->with('error', 'This feature requires Professional plan');
    }

    return $next($request);
}
```

---

### **Phase 4: Renewal (Gia hạn tự động)**

| Bước | Mô tả                | Stripe Event                    | Thời điểm             |
| ---- | -------------------- | ------------------------------- | --------------------- |
| 4.1  | Stripe tạo invoice   | `invoice.created`               | ~1 ngày trước ends_at |
| 4.2  | Stripe charge card   | `invoice.payment_succeeded`     | Ngày ends_at          |
| 4.3  | Subscription renewed | `customer.subscription.updated` | Sau payment           |

```
Database State AFTER successful renewal:
┌─────────────────────────────────────────────────────────┐
│ subscriptions (UPDATED)                                 │
├─────────────────────────────────────────────────────────┤
│ status: 'active'                                        │
│ starts_at: 2026-01-06 10:00:00  ← OLD ends_at           │
│ ends_at: 2026-02-06 10:00:00    ← NEW +1 month          │
│ current_period_start: 2026-01-06                        │
│ current_period_end: 2026-02-06                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ payments (NEW RECORD)                                   │
├─────────────────────────────────────────────────────────┤
│ type: 'renewal'                                         │
│ billing_period_start: 2026-01-06                        │
│ billing_period_end: 2026-02-06                          │
└─────────────────────────────────────────────────────────┘
```

---

### **Phase 5: Cancellation (Hủy subscription)**

| Bước | Mô tả                      | Kết quả                                    |
| ---- | -------------------------- | ------------------------------------------ |
| 5.1  | User click Cancel          | -                                          |
| 5.2  | Confirm dialog             | "Bạn vẫn có access đến [date]"             |
| 5.3  | Update local DB            | status = 'cancelled', cancelled_at = now() |
| 5.4  | Call Stripe API (optional) | Cancel on Stripe để không charge tiếp      |
| 5.5  | User vẫn có access         | Đến khi ends_at qua                        |

```
Database State AFTER cancellation:
┌─────────────────────────────────────────────────────────┐
│ subscriptions                                           │
├─────────────────────────────────────────────────────────┤
│ status: 'cancelled'                                     │
│ cancelled_at: 2025-12-10 15:00:00                       │
│ cancellation_reason: 'user_requested'                   │
│ ends_at: 2026-01-06 10:00:00  ← KHÔNG ĐỔI               │
│ auto_renew: false                                       │
└─────────────────────────────────────────────────────────┘

hasAccess() = TRUE (vì ends_at chưa qua)
```

---

### **Phase 6: Resume (Kích hoạt lại)**

| Điều kiện                         | Có thể Resume?         |
| --------------------------------- | ---------------------- |
| Status = cancelled, ends_at > now | ✅ Có                  |
| Status = expired                  | ❌ Không, phải mua mới |

```
Database State AFTER resume:
┌─────────────────────────────────────────────────────────┐
│ subscriptions                                           │
├─────────────────────────────────────────────────────────┤
│ status: 'active'                                        │
│ cancelled_at: NULL                                      │
│ auto_renew: true                                        │
└─────────────────────────────────────────────────────────┘
```

---

### **Phase 7: Expiration (Hết hạn)**

| Trigger                  | Hành động                                       |
| ------------------------ | ----------------------------------------------- |
| Scheduled job chạy daily | Check `ends_at < now()` AND status != 'expired' |
| Update status            | status = 'expired'                              |
| Revoke access            | hasAccess() = false                             |

```
Database State AFTER expiration:
┌─────────────────────────────────────────────────────────┐
│ subscriptions                                           │
├─────────────────────────────────────────────────────────┤
│ status: 'expired'                                       │
│ ends_at: 2026-01-06 10:00:00 (đã qua)                   │
└─────────────────────────────────────────────────────────┘

hasAccess() = FALSE
```

---

### **Phase 8: Payment Failure (Thanh toán thất bại)**

| Bước | Stripe Event                  | Hành động                               |
| ---- | ----------------------------- | --------------------------------------- |
| 8.1  | Card bị từ chối               | `invoice.payment_failed`                |
| 8.2  | Stripe retry                  | Tự động retry 3-4 lần                   |
| 8.3  | Update status                 | status = 'past_due'                     |
| 8.4  | Set grace period              | grace_period_ends_at = ends_at + 3 days |
| 8.5  | Gửi email yêu cầu update card | -                                       |
| 8.6  | Nếu hết grace period          | status = 'expired'                      |

---

## 🗂️ Database Schema Chuẩn

### Plans Table

```sql
plans
├── id
├── name                    -- "Professional"
├── slug                    -- "professional-monthly"
├── description
├── price                   -- 9.99
├── currency                -- "USD"
├── billing_interval        -- "month" | "year"
├── interval_count          -- 1 (1 month), 3 (3 months), 12 (1 year)
├── features                -- JSON array
├── stripe_price_id         -- "price_xxx" ⭐ QUAN TRỌNG
├── is_active
├── sort_order
├── created_at
└── updated_at
```

### Subscriptions Table

```sql
subscriptions
├── id
├── user_id
├── plan_id
├── status                  -- active | cancelled | expired | past_due
├── starts_at               -- ⭐ Ngày bắt đầu
├── ends_at                 -- ⭐ Ngày kết thúc (QUAN TRỌNG NHẤT)
├── cancelled_at
├── cancellation_reason
├── auto_renew              -- true | false
├── grace_period_ends_at
├── renewal_notified_at
├── stripe_subscription_id  -- "sub_xxx"
├── stripe_customer_id      -- "cus_xxx"
├── created_at
└── updated_at
```

### Payments Table

```sql
payments
├── id
├── user_id
├── subscription_id
├── plan_id
├── amount
├── currency
├── status                  -- pending | completed | failed | cancelled
├── type                    -- initial | renewal | upgrade
├── billing_period_start    -- ⭐ Payment covers từ ngày này
├── billing_period_end      -- ⭐ Payment covers đến ngày này
├── invoice_number
├── stripe_invoice_id
├── stripe_payment_intent_id
├── card_brand
├── card_last_four
├── paid_at
├── failure_code
├── failure_message
├── created_at
└── updated_at
```

---

## ✅ Checklist Kiểm tra Hệ thống

### Checkout Flow

- [ ] User không có active subscription mới được mua
- [ ] Webhook `checkout.session.completed` tạo đúng subscription + payment
- [ ] `starts_at` và `ends_at` được set chính xác
- [ ] Redirect về billing page với success message

### Active Subscription

- [ ] `hasAccess()` trả về đúng
- [ ] Countdown hiển thị chính xác
- [ ] Pro features được protect bởi middleware

### Cancellation

- [ ] Status = 'cancelled' nhưng vẫn có access
- [ ] UI hiển thị rõ "cancelled but has access until [date]"
- [ ] Có thể Resume trước khi expired

### Renewal

- [ ] Auto-renew tạo payment mới với type = 'renewal'
- [ ] `starts_at` mới = `ends_at` cũ
- [ ] `ends_at` mới = +1 month/year

### Expiration

- [ ] Scheduled job chạy daily
- [ ] Status chuyển thành 'expired'
- [ ] `hasAccess()` = false
- [ ] UI hiển thị "Free Plan"

### Payment Failure

- [ ] Grace period được set
- [ ] User vẫn có access trong grace period
- [ ] Email thông báo update payment method
- [ ] Expire sau grace period

---

## 🔧 Đề xuất Refactor cho dự án

### Những gì đã có ✅

1. Plans, Subscriptions, Payments tables
2. Webhook handlers cơ bản
3. `hasAccess()`, `currentSubscription()`
4. Cancel/Resume functionality
5. Countdown UI

### Cần cải thiện 🔧

1. **Stripe Subscription ID** - Lưu `stripe_subscription_id` để sync với Stripe
2. **Cancel trên Stripe** - Gọi Stripe API khi user cancel
3. **Scheduled Jobs** - Expire subscriptions, send notifications
4. **Middleware cho Pro features** - Protect routes
5. **Error handling** - Payment failures, webhook retries

---

## 📝 Action Items

### Priority 1: Critical Fixes

- [ ] Đảm bảo `starts_at` và `ends_at` luôn được set khi tạo subscription
- [ ] Fix `cancelSubscription()` để set `ends_at` nếu null
- [ ] Test toàn bộ flow từ checkout đến expiration

### Priority 2: Improvements

- [ ] Thêm middleware protect Pro features
- [ ] Cải thiện UI cho cancelled subscription
- [ ] Thêm email notifications

### Priority 3: Nice to have

- [ ] Coupon/discount codes
- [ ] Upgrade/downgrade between plans
- [ ] Prorated billing

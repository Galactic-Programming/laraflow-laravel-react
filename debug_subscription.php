<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Subscription;

// Get latest user
$user = User::latest()->first();
echo "User: {$user->email}\n";

// Get current subscription
$subscription = $user->currentSubscription;

if ($subscription) {
    echo "=== Current Subscription ===\n";
    echo "ID: {$subscription->id}\n";
    echo "Status: {$subscription->status->value}\n";
    echo "starts_at: {$subscription->starts_at}\n";
    echo "ends_at: {$subscription->ends_at}\n";
    echo "cancelled_at: {$subscription->cancelled_at}\n";
    echo "hasAccess(): " . ($subscription->hasAccess() ? 'true' : 'false') . "\n";
    echo "isCancelledButActive(): " . ($subscription->isCancelledButActive() ? 'true' : 'false') . "\n";
} else {
    echo "No currentSubscription found\n";

    // Check if there's any subscription at all
    $anySub = Subscription::where('user_id', $user->id)->latest()->first();
    if ($anySub) {
        echo "\n=== Raw Subscription (not from currentSubscription) ===\n";
        echo "ID: {$anySub->id}\n";
        echo "Status: {$anySub->status->value}\n";
        echo "starts_at: {$anySub->starts_at}\n";
        echo "ends_at: {$anySub->ends_at}\n";
        echo "cancelled_at: {$anySub->cancelled_at}\n";
        echo "ends_at > now: " . ($anySub->ends_at && $anySub->ends_at->isFuture() ? 'true' : 'false') . "\n";
    }
}

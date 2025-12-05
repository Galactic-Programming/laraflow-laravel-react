<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Commands
|--------------------------------------------------------------------------
|
| Here you may define all of your scheduled commands. These commands will
| be run by the scheduler according to the schedule you define.
|
*/

// Send renewal notifications daily at 9:00 AM
Schedule::command('subscriptions:send-renewal-notifications')->dailyAt('09:00');

// Expire past-due subscriptions every hour
Schedule::command('subscriptions:expire-past-due')->hourly();

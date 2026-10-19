<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:release-expired')
    ->everyFiveMinutes()
    ->withoutOverlapping();

if (class_exists('Vmt\\PayFast\\Console\\DispatchOutboxCommand')) {
    Schedule::command('payfast:dispatch-outbox')
        ->everyMinute()
        ->withoutOverlapping();
}

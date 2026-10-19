<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:release-expired')
    ->everyFiveMinutes()
    ->withoutOverlapping();

Schedule::command('payfast:dispatch-outbox')
    ->everyMinute()
    ->withoutOverlapping();

<?php

use Illuminate\Support\Facades\Schedule;

if (class_exists(\Vmt\PayFast\Console\DispatchOutboxCommand::class)) {
    Schedule::command('payfast:dispatch-outbox')->everyMinute()->withoutOverlapping();
}

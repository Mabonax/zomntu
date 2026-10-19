<?php

namespace App\Providers;

use App\Listeners\CompleteZomntuOrder;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureDefaults();

        $eventClass = 'Vmt\\PayFast\\Events\\PaymentCompleted';

        if (class_exists($eventClass)) {
            Event::listen($eventClass, CompleteZomntuOrder::class);
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        DB::prohibitDestructiveCommands(app()->isProduction());

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)->mixedCase()->letters()->numbers()->symbols()->uncompromised()
            : null
        );
    }
}

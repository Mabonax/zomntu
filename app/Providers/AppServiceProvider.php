<?php

namespace App\Providers;

use App\Listeners\CompleteZomntuOrder;
use App\Models\Order;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Vmt\PayFast\Events\PaymentCompleted;
use Vmt\PayFast\Models\PaymentTransaction;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureDefaults();

        Event::listen(PaymentCompleted::class, CompleteZomntuOrder::class);

        Gate::define(
            'view-payfast-payment',
            function (User $user, PaymentTransaction $payment): bool {
                $orderReference = data_get($payment, 'order_reference');

                return is_string($orderReference)
                    && Order::query()
                        ->where('user_id', $user->id)
                        ->where('reference', $orderReference)
                        ->exists();
            },
        );
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        DB::prohibitDestructiveCommands(app()->isProduction());

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}

<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users are routed to their order account', function () {
    $user = User::factory()->create();

    $this->withoutMiddleware(ValidateSessionWithWorkOS::class)
        ->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect(route('account.orders'));
});

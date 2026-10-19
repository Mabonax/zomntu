<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

uses(RefreshDatabase::class);

test('storefront and shop render', function () {
    Product::query()->create([
        'name' => 'Heavy Tee',
        'slug' => 'heavy-tee',
        'sku' => 'TEE-001',
        'category' => 'Tees',
        'price_cents' => 59900,
        'stock' => 10,
        'is_active' => true,
        'is_featured' => true,
    ]);

    $this->get('/')->assertOk();
    $this->get('/shop')->assertOk();
    $this->get('/shop/heavy-tee')->assertOk();
});

test('shopper can add product to cart', function () {
    $product = Product::query()->create([
        'name' => 'Heavy Tee',
        'slug' => 'heavy-tee',
        'sku' => 'TEE-001',
        'category' => 'Tees',
        'price_cents' => 59900,
        'stock' => 10,
        'is_active' => true,
    ]);

    $this->post('/cart/'.$product->id, ['quantity' => 2])
        ->assertRedirect();

    expect(session('cart')[$product->id.'|base']['quantity'])->toBe(2);
});

test('shopper cannot access administrator workspace', function () {
    $user = User::factory()->create(['role' => 'shopper']);

    $this->withoutMiddleware(ValidateSessionWithWorkOS::class)
        ->actingAs($user)
        ->get('/admin')
        ->assertForbidden();
});

test('administrator can access administrator workspace', function () {
    $user = User::factory()->create(['role' => 'administrator']);

    $this->withoutMiddleware(ValidateSessionWithWorkOS::class)
        ->actingAs($user)
        ->get('/admin')
        ->assertOk();
});

test('administrator can create a product', function () {
    $user = User::factory()->create(['role' => 'administrator']);

    $this->withoutMiddleware(ValidateSessionWithWorkOS::class)
        ->actingAs($user)
        ->post('/admin/products', [
            'name' => 'Ultra Heavy Tee',
            'sku' => 'TEE-ULTRA-001',
            'category' => 'Tees',
            'price' => '799.00',
            'gsm' => 300,
            'colour' => 'Black',
            'stock' => 5,
            'is_featured' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'sku' => 'TEE-ULTRA-001',
        'price_cents' => 79900,
    ]);
});

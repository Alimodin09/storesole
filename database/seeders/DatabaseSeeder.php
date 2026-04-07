<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@solestore.com'],
            [
                'name' => 'SoleStore Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@solestore.com'],
            [
                'name' => 'SoleStore Customer',
                'password' => Hash::make('password'),
                'role' => 'customer',
            ]
        );

        Product::updateOrCreate(
            ['name' => 'Classic Black School Shoes'],
            [
                'price' => 1299,
                'size' => '38',
                'stock' => 30,
                'description' => 'Durable black leather shoes for daily school use.',
            ]
        );

        Product::updateOrCreate(
            ['name' => 'White PE Rubber Shoes'],
            [
                'price' => 999,
                'size' => '36',
                'stock' => 18,
                'description' => 'Comfortable and lightweight white shoes for PE classes.',
            ]
        );

        Order::updateOrCreate(
            ['id' => 1],
            [
                'user_id' => $customer->id,
                'total' => 1299,
                'status' => 'Pending',
            ]
        );

        Order::updateOrCreate(
            ['id' => 2],
            [
                'user_id' => $customer->id,
                'total' => 1998,
                'status' => 'Processing',
            ]
        );
    }
}

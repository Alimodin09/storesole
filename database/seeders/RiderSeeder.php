<?php

namespace Database\Seeders;

use App\Models\Rider;
use App\Models\User;
use Illuminate\Database\Seeder;

class RiderSeeder extends Seeder
{
    public function run(): void
    {
        // Create rider user account (for login)
        $user = User::firstOrCreate(
            ['email' => 'rider@solestore.com'],
            [
                'name' => 'Juan Rider',
                'password' => 'password',
                'role' => 'rider',
            ]
        );

        // Create rider profile (for assignment)
        Rider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Juan Rider',
                'phone' => '09171234567',
                'status' => 'available',
            ]
        );

        echo "Rider seeded: rider@solestore.com / password\n";
    }
}

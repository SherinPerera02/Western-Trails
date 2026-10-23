<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_SEED_EMAIL', 'admin@westerntrails.lk');
        $password = env('ADMIN_SEED_PASSWORD', 'Admin@12345');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => 'Administrator',
                'password' => Hash::make($password),
                'role'     => 'admin',
                'status'   => 'active',
            ]
        );
    }
}

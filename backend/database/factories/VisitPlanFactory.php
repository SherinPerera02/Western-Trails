<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VisitPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VisitPlan>
 */
class VisitPlanFactory extends Factory
{
    protected $model = VisitPlan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'    => User::factory(),
            'plan_name'  => 'Trip to ' . fake()->city(),
            'visit_date' => now()->addDays(fake()->numberBetween(1, 30))->format('Y-m-d'),
        ];
    }
}

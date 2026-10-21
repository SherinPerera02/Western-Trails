<?php

namespace Database\Factories;

use App\Models\Attraction;
use App\Models\PlanItem;
use App\Models\VisitPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanItem>
 */
class PlanItemFactory extends Factory
{
    protected $model = PlanItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'visit_plan_id' => VisitPlan::factory(),
            'attraction_id' => Attraction::factory(),
            'sequence'      => 1,
            'start_time'    => '09:00:00',
            'notes'         => fake()->sentence(),
        ];
    }
}

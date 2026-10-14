<?php

namespace Database\Factories;

use App\Models\Attraction;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'attraction_id' => Attraction::factory(),
            'rating'        => fake()->numberBetween(1, 5),
            'comment'       => fake()->sentence(),
            'status'        => 'approved',
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }
}

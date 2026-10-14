<?php

namespace Database\Factories;

use App\Models\Attraction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attraction>
 */
class AttractionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'               => ucfirst(fake()->words(3, true)),
            'description'        => fake()->paragraph(),
            'address'            => fake()->address(),
            'latitude'           => fake()->randomFloat(7, 6.5, 6.9),
            'longitude'          => fake()->randomFloat(7, 79.8, 80.1),
            'distance_km'        => fake()->randomFloat(2, 0.5, 20.0),
            'opening_hours'      => '08:00 - 18:00',
            'entrance_fee'       => fake()->randomFloat(2, 0, 500),
            'facilities'         => 'Parking, Restrooms',
            'activities'         => 'Sightseeing, Photography',
            'travel_tips'        => 'Visit during morning hours',
            'visitor_guidelines' => 'Keep the premises clean',
            'contact_info'       => fake()->phoneNumber(),
            'status'             => 'active',
        ];
    }

    /**
     * Indicate that the attraction is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}

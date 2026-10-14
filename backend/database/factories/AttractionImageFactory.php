<?php

namespace Database\Factories;

use App\Models\Attraction;
use App\Models\AttractionImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttractionImage>
 */
class AttractionImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'attraction_id' => Attraction::factory(),
            'image_path'    => 'places/1/' . fake()->uuid() . '.jpg',
            'caption'       => fake()->sentence(),
        ];
    }
}

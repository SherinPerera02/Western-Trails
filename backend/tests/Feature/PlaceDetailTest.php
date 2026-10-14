<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\AttractionImage;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaceDetailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test valid public place details returns PlaceDetailResource with all required fields.
     */
    public function test_public_place_details_returns_expected_structure_and_no_internal_fields(): void
    {
        $category = Category::factory()->create([
            'name'   => 'Heritage & History',
            'status' => 'active',
        ]);

        $place = Attraction::factory()->create([
            'name'               => 'Richmond Castle Kalutara',
            'description'        => 'A grand British-era mansion built in 1910.',
            'address'            => 'Riverside Road, Kalutara',
            'latitude'           => 6.5840,
            'longitude'          => 79.9710,
            'distance_km'        => 14.50,
            'opening_hours'      => '08:30 - 16:30 Daily',
            'entrance_fee'       => 500.0,
            'facilities'         => "Car Park\nRestrooms\nInformation Center",
            'activities'         => 'Heritage photography, guided mansion walk',
            'travel_tips'        => 'Visit early in the morning to beat the heat.',
            'visitor_guidelines' => 'Photography permitted in gardens only.',
            'contact_info'       => '+94 34 222 3456',
            'status'             => 'active',
        ]);
        $place->categories()->attach($category->id);

        AttractionImage::factory()->create([
            'attraction_id' => $place->id,
            'image_path'    => 'places/1/castle_front.jpg',
            'caption'       => 'Front Façade',
        ]);

        $response = $this->getJson("/api/places/{$place->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'categories' => [
                        '*' => ['id', 'name', 'description', 'status'],
                    ],
                    'description',
                    'address',
                    'latitude',
                    'longitude',
                    'distance_km',
                    'opening_hours',
                    'entrance_fee',
                    'is_free',
                    'facilities',
                    'activities',
                    'travel_tips',
                    'visitor_guidelines',
                    'contact_info',
                    'images' => [
                        '*' => ['id', 'url', 'caption'],
                    ],
                    'average_rating',
                    'reviews_count',
                    'nearby',
                ],
            ]);

        $data = $response->json('data');

        // Check values
        $this->assertEquals($place->id, $data['id']);
        $this->assertEquals('Richmond Castle Kalutara', $data['name']);
        $this->assertEquals(500.0, $data['entrance_fee']);
        $this->assertFalse($data['is_free']); // entrance_fee is 500

        // Multi-line facilities split into array
        $this->assertIsArray($data['facilities']);
        $this->assertEquals(['Car Park', 'Restrooms', 'Information Center'], $data['facilities']);

        // Single-line activities kept as-is
        $this->assertIsString($data['activities']);
        $this->assertEquals('Heritage photography, guided mansion walk', $data['activities']);

        // Images array
        $this->assertCount(1, $data['images']);
        $this->assertEquals('Front Façade', $data['images'][0]['caption']);
        $this->assertStringContainsString('storage/places/1/castle_front.jpg', $data['images'][0]['url']);

        // No internal fields exposed
        $this->assertArrayNotHasKey('created_at', $data);
        $this->assertArrayNotHasKey('updated_at', $data);
        $this->assertArrayNotHasKey('deleted_at', $data);
        $this->assertArrayNotHasKey('status', $data);
        $this->assertArrayNotHasKey('warning', $data);
    }

    /**
     * Test free entrance fee produces is_free = true.
     */
    public function test_free_entrance_fee_flags_is_free_true(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        // Fee = 0
        $pZero = Attraction::factory()->create([
            'entrance_fee' => 0.0,
            'status'       => 'active',
        ]);
        $pZero->categories()->attach($cat->id);

        $resZero = $this->getJson("/api/places/{$pZero->id}");
        $resZero->assertOk();
        $this->assertTrue($resZero->json('data.is_free'));
        $this->assertEquals(0.0, $resZero->json('data.entrance_fee'));

        // Fee = null
        $pNull = Attraction::factory()->create([
            'entrance_fee' => null,
            'status'       => 'active',
        ]);
        $pNull->categories()->attach($cat->id);

        $resNull = $this->getJson("/api/places/{$pNull->id}");
        $resNull->assertOk();
        $this->assertTrue($resNull->json('data.is_free'));
        $this->assertNull($resNull->json('data.entrance_fee'));
    }

    /**
     * Test 404 response for deleted, inactive, non-existent, and non-numeric ids.
     */
    public function test_404_response_for_deleted_inactive_and_missing_places(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        // Inactive place
        $inactive = Attraction::factory()->create([
            'status' => 'inactive',
        ]);
        $inactive->categories()->attach($cat->id);

        // Soft-deleted place
        $deleted = Attraction::factory()->create([
            'status' => 'active',
        ]);
        $deleted->categories()->attach($cat->id);
        $deleted->delete();

        // 1. Inactive place -> 404 with standard message
        $resInactive = $this->getJson("/api/places/{$inactive->id}");
        $resInactive->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);

        // 2. Soft-deleted place -> 404 with identical message
        $resDeleted = $this->getJson("/api/places/{$deleted->id}");
        $resDeleted->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);

        // 3. Non-existent id -> 404 with identical message
        $resMissing = $this->getJson('/api/places/999999');
        $resMissing->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);

        // 4. Non-numeric id -> 404 with identical message
        $resInvalid = $this->getJson('/api/places/not-an-id');
        $resInvalid->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);
    }

    /**
     * Test average_rating and reviews_count only count approved reviews.
     */
    public function test_reviews_metrics_only_count_approved_reviews(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);
        $place = Attraction::factory()->create(['status' => 'active']);
        $place->categories()->attach($cat->id);

        // When place has no reviews
        $resNoReviews = $this->getJson("/api/places/{$place->id}");
        $resNoReviews->assertOk();
        $this->assertNull($resNoReviews->json('data.average_rating'));
        $this->assertEquals(0, $resNoReviews->json('data.reviews_count'));

        // Add 2 approved reviews (5 and 4 -> avg 4.5)
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();
        $u3 = User::factory()->create();
        $u4 = User::factory()->create();

        Review::create(['user_id' => $u1->id, 'attraction_id' => $place->id, 'rating' => 5, 'status' => 'approved']);
        Review::create(['user_id' => $u2->id, 'attraction_id' => $place->id, 'rating' => 4, 'status' => 'approved']);

        // Add 1 pending and 1 rejected review (should be excluded)
        Review::create(['user_id' => $u3->id, 'attraction_id' => $place->id, 'rating' => 1, 'status' => 'rejected']);
        Review::create(['user_id' => $u4->id, 'attraction_id' => $place->id, 'rating' => 5, 'status' => 'pending']);

        $resWithReviews = $this->getJson("/api/places/{$place->id}");
        $resWithReviews->assertOk();
        $this->assertEquals(4.5, $resWithReviews->json('data.average_rating'));
        $this->assertEquals(2, $resWithReviews->json('data.reviews_count'));
    }

    /**
     * Test nearby places: up to 4 places within 5km, sorted by distance, excluding self and places > 5km.
     */
    public function test_nearby_places_calculation(): void
    {
        $cat = Category::factory()->create(['name' => 'Coastal', 'status' => 'active']);

        // Reference place: Panadura beach (approx 6.7132, 79.9074)
        $target = Attraction::factory()->create([
            'name'      => 'Panadura Beach Central',
            'latitude'  => 6.7132,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $target->categories()->attach($cat->id);

        // Nearby 1: ~0.8 km north
        $near1 = Attraction::factory()->create([
            'name'      => 'Panadura Harbor Point',
            'latitude'  => 6.7200,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $near1->categories()->attach($cat->id);

        // Nearby 2: ~1.5 km south
        $near2 = Attraction::factory()->create([
            'name'      => 'Modara Beach Walk',
            'latitude'  => 6.7000,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $near2->categories()->attach($cat->id);

        // Nearby 3: ~3.0 km east
        $near3 = Attraction::factory()->create([
            'name'      => 'Bolgoda Lake Edge',
            'latitude'  => 6.7132,
            'longitude' => 79.9340,
            'status'    => 'active',
        ]);
        $near3->categories()->attach($cat->id);

        // Far away: ~15 km south (Kalutara) -> MUST be excluded (> 5km)
        $farAway = Attraction::factory()->create([
            'name'      => 'Kalutara Bodhiya',
            'latitude'  => 6.5800,
            'longitude' => 79.9600,
            'status'    => 'active',
        ]);
        $farAway->categories()->attach($cat->id);

        // Inactive nearby: ~1.0 km away -> MUST be excluded (inactive)
        $inactiveNear = Attraction::factory()->create([
            'name'      => 'Inactive Nearby Park',
            'latitude'  => 6.7150,
            'longitude' => 79.9100,
            'status'    => 'inactive',
        ]);
        $inactiveNear->categories()->attach($cat->id);

        $response = $this->getJson("/api/places/{$target->id}");

        $response->assertOk();
        $nearby = $response->json('data.nearby');

        $this->assertIsArray($nearby);
        $this->assertCount(3, $nearby);

        $nearbyIds = collect($nearby)->pluck('id')->all();

        // Target itself is excluded
        $this->assertNotContains($target->id, $nearbyIds);

        // Far away place (>5km) is excluded
        $this->assertNotContains($farAway->id, $nearbyIds);

        // Inactive place is excluded
        $this->assertNotContains($inactiveNear->id, $nearbyIds);

        // Contained items are near1, near2, near3
        $this->assertContains($near1->id, $nearbyIds);
        $this->assertContains($near2->id, $nearbyIds);
        $this->assertContains($near3->id, $nearbyIds);

        // Sorted by distance_from_here_km ascending
        $distances = collect($nearby)->pluck('distance_from_here_km')->all();
        $sortedDistances = $distances;
        sort($sortedDistances);
        $this->assertEquals($sortedDistances, $distances);

        // Check structure of each nearby item
        $item = $nearby[0];
        $this->assertArrayHasKey('id', $item);
        $this->assertArrayHasKey('name', $item);
        $this->assertArrayHasKey('category_names', $item);
        $this->assertArrayHasKey('categories', $item);
        $this->assertArrayHasKey('distance_from_here_km', $item);
        $this->assertArrayHasKey('first_image', $item);
    }
}

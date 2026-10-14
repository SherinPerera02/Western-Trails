<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaceManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tourist;
    private Category $activeCategory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role'   => 'admin',
            'status' => 'active',
        ]);

        $this->tourist = User::factory()->create([
            'role'   => 'tourist',
            'status' => 'active',
        ]);

        $this->activeCategory = Category::factory()->create([
            'status' => 'active',
        ]);
    }

    public function test_admin_can_create_place_with_valid_data(): void
    {
        $payload = [
            'name'         => 'Bolgoda Lake Sanctuary',
            'description'  => 'Peaceful wetlands and boat rides.',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.7450,
            'longitude'    => 79.9200,
            'address'      => 'Bolgoda, Panadura',
            'opening_hours' => '07:00 - 18:00',
            'entrance_fee' => 0,
            'status'       => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/places', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Bolgoda Lake Sanctuary');
        $this->assertNotNull($response->json('data.distance_km'));
        $this->assertDatabaseHas('attractions', ['name' => 'Bolgoda Lake Sanctuary']);
        $this->assertDatabaseHas('attraction_category', ['category_id' => $this->activeCategory->id]);
    }

    public function test_creating_without_category_ids_fails_br_003(): void
    {
        // 1. Missing category_ids
        $responseMissing = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'        => 'Place Without Cat',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
        ]);
        $responseMissing->assertStatus(422);
        $responseMissing->assertJsonValidationErrors(['category_ids']);

        // 2. Empty category_ids array
        $responseEmpty = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Place Without Cat',
            'description'  => 'Desc',
            'category_ids' => [],
            'latitude'     => 6.71,
            'longitude'    => 79.90,
        ]);
        $responseEmpty->assertStatus(422);
        $responseEmpty->assertJsonValidationErrors(['category_ids']);
    }

    public function test_invalid_latitude_fails(): void
    {
        // Below Sri Lanka minimum bound 5.9
        $response = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Out of Bounds Place',
            'description'  => 'Desc',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 4.2,
            'longitude'    => 79.90,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['latitude']);
    }

    public function test_client_sent_distance_km_is_ignored_and_server_value_used(): void
    {
        $payload = [
            'name'         => 'Wadduwa Shoreline',
            'description'  => 'Beach near Panadura.',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.6667,
            'longitude'    => 79.9333,
            'distance_km'  => 888.88, // Tampered client value
            'status'       => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/places', $payload);

        $response->assertStatus(201);
        $savedDistance = $response->json('data.distance_km');
        $this->assertNotEquals(888.88, $savedDistance);
        $this->assertLessThan(20, $savedDistance);
    }

    public function test_update_recalculates_distance(): void
    {
        $place = Attraction::factory()->create([
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 0.0,
            'status'      => 'active',
        ]);
        $place->categories()->attach($this->activeCategory->id);

        // Move coordinates to Galle (lat 6.0535, lng 80.2210, ~81 km)
        $response = $this->actingAs($this->admin)->putJson("/api/places/{$place->id}", [
            'latitude'  => 6.0535,
            'longitude' => 80.2210,
        ]);

        $response->assertStatus(200);
        $newDistance = $response->json('data.distance_km');
        $this->assertGreaterThan(25, $newDistance);
        $this->assertNotNull($response->json('warning') ?? $response->json('data.warning'));
    }

    public function test_soft_delete_hides_place_from_public_but_admin_can_see_with_trashed_only(): void
    {
        $place = Attraction::factory()->create(['status' => 'active']);
        $place->categories()->attach($this->activeCategory->id);

        // Admin soft-deletes place
        $deleteResp = $this->actingAs($this->admin)->deleteJson("/api/places/{$place->id}");
        $deleteResp->assertStatus(200);
        $this->assertSoftDeleted('attractions', ['id' => $place->id]);

        // Public index: hidden
        $publicResp = $this->getJson('/api/places');
        $publicResp->assertStatus(200);
        $publicResp->assertJsonMissing(['id' => $place->id]);

        // Public show: returns 404
        $showResp = $this->getJson("/api/places/{$place->id}");
        $showResp->assertStatus(404);

        // Admin trashed=only: place is visible
        $trashedResp = $this->actingAs($this->admin)->getJson('/api/admin/places?trashed=only');
        $trashedResp->assertStatus(200);
        $trashedResp->assertJsonFragment(['id' => $place->id]);
    }

    public function test_restore_works(): void
    {
        $place = Attraction::factory()->create(['status' => 'active']);
        $place->delete();

        $restoreResp = $this->actingAs($this->admin)->postJson("/api/admin/places/{$place->id}/restore");

        $restoreResp->assertStatus(200);
        $this->assertNotSoftDeleted('attractions', ['id' => $place->id]);

        // Visible to public again
        $this->getJson("/api/places/{$place->id}")->assertStatus(200);
    }

    public function test_tourist_and_guest_cannot_create_update_or_delete_places(): void
    {
        $place = Attraction::factory()->create();

        // Guest write rejection (401)
        $this->postJson('/api/places', [])->assertStatus(401);
        $this->putJson("/api/places/{$place->id}", [])->assertStatus(401);
        $this->deleteJson("/api/places/{$place->id}")->assertStatus(401);
        $this->getJson('/api/admin/places')->assertStatus(401);

        // Tourist write rejection (403)
        $this->actingAs($this->tourist)->postJson('/api/places', [])->assertStatus(403);
        $this->actingAs($this->tourist)->putJson("/api/places/{$place->id}", [])->assertStatus(403);
        $this->actingAs($this->tourist)->deleteJson("/api/places/{$place->id}")->assertStatus(403);
        $this->actingAs($this->tourist)->getJson('/api/admin/places')->assertStatus(403);
    }

    public function test_inactive_places_are_hidden_from_public(): void
    {
        $inactive = Attraction::factory()->inactive()->create([
            'name' => 'Secret Inactive Spot',
        ]);
        $inactive->categories()->attach($this->activeCategory->id);

        $responseList = $this->getJson('/api/places');
        $responseList->assertStatus(200);
        $responseList->assertJsonMissing(['name' => 'Secret Inactive Spot']);

        $responseShow = $this->getJson("/api/places/{$inactive->id}");
        $responseShow->assertStatus(404);
        $responseShow->assertJson(['message' => 'Place not found.']);
    }
}

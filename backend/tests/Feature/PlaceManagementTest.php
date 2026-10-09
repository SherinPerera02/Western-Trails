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
    private Category $inactiveCategory;

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

        $this->activeCategory = Category::create([
            'name'   => 'Beaches & Coastline',
            'status' => 'active',
        ]);

        $this->inactiveCategory = Category::create([
            'name'   => 'Archived Spot',
            'status' => 'inactive',
        ]);
    }

    public function test_public_can_list_active_places_with_pagination(): void
    {
        for ($i = 1; $i <= 16; $i++) {
            $place = Attraction::create([
                'name'        => "Active Place {$i}",
                'description' => "Description for place {$i}",
                'latitude'    => 6.7133,
                'longitude'   => 79.9026,
                'distance_km' => 0.0,
                'status'      => 'active',
            ]);
            $place->categories()->attach($this->activeCategory->id);
        }

        $inactivePlace = Attraction::create([
            'name'        => 'Inactive Place',
            'description' => 'Should not appear in public index',
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 0.0,
            'status'      => 'inactive',
        ]);
        $inactivePlace->categories()->attach($this->activeCategory->id);

        $response = $this->getJson('/api/places');

        $response->assertStatus(200);
        $response->assertJsonCount(15, 'data');
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'description',
                    'latitude',
                    'longitude',
                    'distance_km',
                    'status',
                    'categories',
                    'images',
                ],
            ],
            'links',
            'meta',
        ]);
        $response->assertJsonMissing(['name' => 'Inactive Place']);

        // Public users must NEVER see deleted_at
        $this->assertArrayNotHasKey('deleted_at', $response->json('data.0'));
    }

    public function test_public_can_view_single_active_place(): void
    {
        $place = Attraction::create([
            'name'        => 'Panadura Beach',
            'description' => 'Golden sands and beautiful sunsets.',
            'address'     => 'Beach Road, Panadura',
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 0.0,
            'status'      => 'active',
        ]);
        $place->categories()->attach($this->activeCategory->id);

        $response = $this->getJson("/api/places/{$place->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Panadura Beach');
        $response->assertJsonPath('data.categories.0.name', 'Beaches & Coastline');
        $this->assertArrayNotHasKey('deleted_at', $response->json('data'));
    }

    public function test_public_cannot_view_inactive_or_missing_place(): void
    {
        $inactive = Attraction::create([
            'name'        => 'Hidden Closed Place',
            'description' => 'Not active',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'inactive',
        ]);

        $responseInactive = $this->getJson("/api/places/{$inactive->id}");
        $responseInactive->assertStatus(404);
        $responseInactive->assertJson(['message' => 'Place not found.']);

        $responseMissing = $this->getJson('/api/places/99999');
        $responseMissing->assertStatus(404);
        $responseMissing->assertJson(['message' => 'Place not found.']);
    }

    public function test_public_cannot_view_soft_deleted_place(): void
    {
        $place = Attraction::create([
            'name'        => 'Deleted Heritage',
            'description' => 'Was deleted',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);
        $place->delete();

        $response = $this->getJson("/api/places/{$place->id}");
        $response->assertStatus(404);
        $response->assertJson(['message' => 'Place not found.']);
    }

    public function test_unauthenticated_user_cannot_access_write_or_admin_endpoints(): void
    {
        $this->postJson('/api/places', [])->assertStatus(401);
        $this->putJson('/api/places/1', [])->assertStatus(401);
        $this->deleteJson('/api/places/1')->assertStatus(401);
        $this->getJson('/api/admin/places')->assertStatus(401);
        $this->postJson('/api/admin/places/1/restore')->assertStatus(401);
    }

    public function test_tourist_user_cannot_access_write_or_admin_endpoints(): void
    {
        $this->actingAs($this->tourist)->postJson('/api/places', [])->assertStatus(403);
        $this->actingAs($this->tourist)->putJson('/api/places/1', [])->assertStatus(403);
        $this->actingAs($this->tourist)->deleteJson('/api/places/1')->assertStatus(403);
        $this->actingAs($this->tourist)->getJson('/api/admin/places')->assertStatus(403);
        $this->actingAs($this->tourist)->postJson('/api/admin/places/1/restore')->assertStatus(403);
    }

    public function test_admin_can_list_all_statuses_and_trashed_only(): void
    {
        $active = Attraction::create([
            'name'        => 'Active One',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);
        $inactive = Attraction::create([
            'name'        => 'Inactive One',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'inactive',
        ]);
        $deleted = Attraction::create([
            'name'        => 'Deleted One',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);
        $deleted->delete();

        // Standard admin list: shows active and inactive, not trashed
        $response = $this->actingAs($this->admin)->getJson('/api/admin/places');
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Active One']);
        $response->assertJsonFragment(['name' => 'Inactive One']);
        $response->assertJsonMissing(['name' => 'Deleted One']);
        $this->assertArrayHasKey('deleted_at', $response->json('data.0'));

        // Trashed only list
        $trashedResponse = $this->actingAs($this->admin)->getJson('/api/admin/places?trashed=only');
        $trashedResponse->assertStatus(200);
        $trashedResponse->assertJsonFragment(['name' => 'Deleted One']);
        $trashedResponse->assertJsonMissing(['name' => 'Active One']);
        $trashedResponse->assertJsonMissing(['name' => 'Inactive One']);
    }

    public function test_admin_can_create_place_within_25km_radius(): void
    {
        $payload = [
            'name'         => 'Bolgoda Lake Resort',
            'description'  => 'Serene lake waters and birdwatching.',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.7450,
            'longitude'    => 79.9200,
            'address'      => 'Bolgoda Lake, Moratuwa',
            'entrance_fee' => 0,
            'status'       => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/places', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Bolgoda Lake Resort');
        $this->assertNotNull($response->json('data.distance_km'));
        $this->assertLessThanOrEqual(25, $response->json('data.distance_km'));

        // Within 25 km: warning should NOT be present
        $this->assertNull($response->json('warning'));
        $this->assertArrayNotHasKey('warning', $response->json('data'));

        $this->assertDatabaseHas('attractions', ['name' => 'Bolgoda Lake Resort']);
        $this->assertDatabaseHas('attraction_category', [
            'category_id' => $this->activeCategory->id,
        ]);
    }

    public function test_admin_creating_place_exceeding_25km_radius_saves_with_warning(): void
    {
        $payload = [
            'name'         => 'Galle Fort Heritage',
            'description'  => 'Colonial ramparts along the southern coast.',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.0535,
            'longitude'    => 80.2210,
            'address'      => 'Church Street, Galle',
            'status'       => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/places', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Galle Fort Heritage');
        $this->assertGreaterThan(25, $response->json('data.distance_km'));

        // Exceeding 25 km: warning field included
        $this->assertNotNull($response->json('warning') ?? $response->json('data.warning'));
        $this->assertDatabaseHas('attractions', ['name' => 'Galle Fort Heritage']);
    }

    public function test_server_calculates_distance_and_ignores_client_distance_km(): void
    {
        $payload = [
            'name'         => 'Wadduwa Beach Spot',
            'description'  => 'Golden beach near Wadduwa.',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.6667,
            'longitude'    => 79.9333,
            'distance_km'  => 999.99, // Attempt to tamper
            'status'       => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/places', $payload);

        $response->assertStatus(201);
        // Distance should be approximately 6 km from Panadura, NOT 999.99
        $this->assertNotEquals(999.99, $response->json('data.distance_km'));
        $this->assertLessThan(15, $response->json('data.distance_km'));
    }

    public function test_store_place_validation_rules(): void
    {
        // 1. Missing required fields
        $resEmpty = $this->actingAs($this->admin)->postJson('/api/places', []);
        $resEmpty->assertStatus(422);
        $resEmpty->assertJsonValidationErrors(['name', 'description', 'category_ids', 'latitude', 'longitude']);

        // 2. Empty category_ids array
        $resNoCat = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Test Place',
            'description'  => 'Desc',
            'category_ids' => [],
            'latitude'     => 6.71,
            'longitude'    => 79.90,
        ]);
        $resNoCat->assertStatus(422);
        $resNoCat->assertJsonValidationErrors(['category_ids']);

        // 3. Inactive category_id
        $resInactiveCat = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Test Place',
            'description'  => 'Desc',
            'category_ids' => [$this->inactiveCategory->id],
            'latitude'     => 6.71,
            'longitude'    => 79.90,
        ]);
        $resInactiveCat->assertStatus(422);
        $resInactiveCat->assertJsonValidationErrors(['category_ids.0']);

        // 4. Coordinates outside Sri Lanka boundaries
        $resOutBounds = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Test Place',
            'description'  => 'Desc',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 4.5, // Below 5.9
            'longitude'    => 75.0, // Below 79.5
        ]);
        $resOutBounds->assertStatus(422);
        $resOutBounds->assertJsonValidationErrors(['latitude', 'longitude']);

        // 5. Negative entrance fee
        $resNegativeFee = $this->actingAs($this->admin)->postJson('/api/places', [
            'name'         => 'Test Place',
            'description'  => 'Desc',
            'category_ids' => [$this->activeCategory->id],
            'latitude'     => 6.71,
            'longitude'    => 79.90,
            'entrance_fee' => -100,
        ]);
        $resNegativeFee->assertStatus(422);
        $resNegativeFee->assertJsonValidationErrors(['entrance_fee']);
    }

    public function test_admin_can_partially_update_place(): void
    {
        $place = Attraction::create([
            'name'        => 'Original Name',
            'description' => 'Original Description',
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 0.0,
            'status'      => 'active',
        ]);
        $place->categories()->attach($this->activeCategory->id);

        $response = $this->actingAs($this->admin)->putJson("/api/places/{$place->id}", [
            'description' => 'Updated Description Only',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Original Name');
        $response->assertJsonPath('data.description', 'Updated Description Only');
        $response->assertJsonPath('data.categories.0.id', $this->activeCategory->id);
    }

    public function test_admin_updating_coordinates_recalculates_distance_and_warning(): void
    {
        $place = Attraction::create([
            'name'        => 'Moving Place',
            'description' => 'Close to Panadura',
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 0.0,
            'status'      => 'active',
        ]);
        $place->categories()->attach($this->activeCategory->id);

        // Move to Galle (>25km)
        $response = $this->actingAs($this->admin)->putJson("/api/places/{$place->id}", [
            'latitude'  => 6.0535,
            'longitude' => 80.2210,
        ]);

        $response->assertStatus(200);
        $this->assertGreaterThan(25, $response->json('data.distance_km'));
        $this->assertNotNull($response->json('warning') ?? $response->json('data.warning'));
    }

    public function test_update_place_validation_fails_for_empty_category_ids(): void
    {
        $place = Attraction::create([
            'name'        => 'Valid Place',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/places/{$place->id}", [
            'category_ids' => [],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_ids']);
    }

    public function test_admin_can_soft_delete_place(): void
    {
        $place = Attraction::create([
            'name'        => 'Place to delete',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/places/{$place->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Place deleted successfully.']);
        $this->assertSoftDeleted('attractions', ['id' => $place->id]);
    }

    public function test_admin_can_restore_soft_deleted_place(): void
    {
        $place = Attraction::create([
            'name'        => 'Place to restore',
            'description' => 'Desc',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'status'      => 'active',
        ]);
        $place->delete();

        $response = $this->actingAs($this->admin)->postJson("/api/admin/places/{$place->id}/restore");

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Place to restore');
        $this->assertNotSoftDeleted('attractions', ['id' => $place->id]);
    }

    public function test_delete_and_restore_return_404_when_not_found(): void
    {
        $this->actingAs($this->admin)->deleteJson('/api/places/99999')->assertStatus(404);
        $this->actingAs($this->admin)->postJson('/api/admin/places/99999/restore')->assertStatus(404);
    }
}

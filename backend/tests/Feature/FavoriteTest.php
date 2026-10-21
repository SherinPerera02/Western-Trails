<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FavoriteTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;
    private User $userB;
    private Attraction $activePlace1;
    private Attraction $activePlace2;
    private Attraction $inactivePlace;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userA = User::factory()->create([
            'role'   => 'tourist',
            'status' => 'active',
        ]);

        $this->userB = User::factory()->create([
            'role'   => 'tourist',
            'status' => 'active',
        ]);

        $category = Category::factory()->create(['status' => 'active']);

        $this->activePlace1 = Attraction::factory()->create([
            'name'        => 'Richmond Castle Kalutara',
            'status'      => 'active',
            'latitude'    => 6.5840,
            'longitude'   => 79.9710,
            'distance_km' => 14.5,
        ]);
        $this->activePlace1->categories()->attach($category->id);

        $this->activePlace2 = Attraction::factory()->create([
            'name'        => 'Panadura Beach Park',
            'status'      => 'active',
            'latitude'    => 6.7133,
            'longitude'   => 79.9026,
            'distance_km' => 1.2,
        ]);
        $this->activePlace2->categories()->attach($category->id);

        $this->inactivePlace = Attraction::factory()->create([
            'name'   => 'Secret Inactive Cave',
            'status' => 'inactive',
        ]);
    }

    /**
     * Requirement: Guests get 401 on all favorites endpoints.
     */
    public function test_guests_get_401_on_all_favorites_endpoints(): void
    {
        $this->getJson('/api/favorites')->assertStatus(401);
        $this->getJson('/api/favorites/ids')->assertStatus(401);
        $this->postJson("/api/favorites/{$this->activePlace1->id}")->assertStatus(401);
        $this->deleteJson("/api/favorites/{$this->activePlace1->id}")->assertStatus(401);
    }

    /**
     * Requirement: Saving a place to favorites is idempotent and returns 200.
     */
    public function test_saving_a_place_is_idempotent_and_returns_200(): void
    {
        // 1. First save
        $response1 = $this->actingAs($this->userA)->postJson("/api/favorites/{$this->activePlace1->id}");
        $response1->assertOk()
            ->assertJsonPath('favorited', true)
            ->assertJsonPath('place_id', $this->activePlace1->id);

        $this->assertDatabaseHas('favorites', [
            'user_id'       => $this->userA->id,
            'attraction_id' => $this->activePlace1->id,
        ]);

        // 2. Second save (idempotent, must not throw error or duplicate)
        $response2 = $this->actingAs($this->userA)->postJson("/api/favorites/{$this->activePlace1->id}");
        $response2->assertOk()
            ->assertJsonPath('favorited', true)
            ->assertJsonPath('place_id', $this->activePlace1->id);

        $this->assertEquals(
            1,
            $this->userA->favorites()->where('attraction_id', $this->activePlace1->id)->count()
        );
    }

    /**
     * Requirement: Cannot save an inactive or soft-deleted place (returns 404).
     */
    public function test_cannot_save_an_inactive_or_deleted_place_returns_404(): void
    {
        // 1. Inactive place
        $responseInactive = $this->actingAs($this->userA)->postJson("/api/favorites/{$this->inactivePlace->id}");
        $responseInactive->assertStatus(404);

        // 2. Soft-deleted place
        $deletedPlace = Attraction::factory()->create(['status' => 'active']);
        $deletedPlace->delete();

        $responseDeleted = $this->actingAs($this->userA)->postJson("/api/favorites/{$deletedPlace->id}");
        $responseDeleted->assertStatus(404);

        // 3. Non-existent place ID
        $responseNonExistent = $this->actingAs($this->userA)->postJson("/api/favorites/999999");
        $responseNonExistent->assertStatus(404);

        $this->assertDatabaseMissing('favorites', [
            'user_id'       => $this->userA->id,
            'attraction_id' => $this->inactivePlace->id,
        ]);
    }

    /**
     * Requirement: Removing a place from favorites is idempotent and returns 200.
     */
    public function test_removing_a_place_is_idempotent_and_returns_200(): void
    {
        $this->userA->favorites()->attach($this->activePlace1->id);

        // 1. First remove
        $response1 = $this->actingAs($this->userA)->deleteJson("/api/favorites/{$this->activePlace1->id}");
        $response1->assertOk()
            ->assertJsonPath('favorited', false);

        $this->assertDatabaseMissing('favorites', [
            'user_id'       => $this->userA->id,
            'attraction_id' => $this->activePlace1->id,
        ]);

        // 2. Second remove (idempotent, place already removed)
        $response2 = $this->actingAs($this->userA)->deleteJson("/api/favorites/{$this->activePlace1->id}");
        $response2->assertOk()
            ->assertJsonPath('favorited', false);
    }

    /**
     * Requirement: User A's list does not show User B's favorites (isolation).
     */
    public function test_user_a_list_does_not_show_user_b_favorites(): void
    {
        // User A saves Place 1
        $this->userA->favorites()->attach($this->activePlace1->id);

        // User B saves Place 2
        $this->userB->favorites()->attach($this->activePlace2->id);

        // User A requests GET /api/favorites
        $responseA = $this->actingAs($this->userA)->getJson('/api/favorites');
        $responseA->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->activePlace1->id);

        // User A requests GET /api/favorites/ids
        $responseAIds = $this->actingAs($this->userA)->getJson('/api/favorites/ids');
        $responseAIds->assertOk()
            ->assertExactJson([
                'data' => [$this->activePlace1->id],
                'ids'  => [$this->activePlace1->id],
            ]);

        // User B requests GET /api/favorites
        $responseB = $this->actingAs($this->userB)->getJson('/api/favorites');
        $responseB->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->activePlace2->id);
    }

    /**
     * Requirement: GET /api/favorites returns lightweight place resources and excludes
     * places that subsequently became inactive or soft-deleted.
     */
    public function test_favorites_list_returns_lightweight_resources_and_excludes_inactive_or_deleted(): void
    {
        $placeToDeactivate = Attraction::factory()->create(['status' => 'active']);
        $placeToDelete = Attraction::factory()->create(['status' => 'active']);

        $this->userA->favorites()->attach([
            $this->activePlace1->id,
            $placeToDeactivate->id,
            $placeToDelete->id,
        ]);

        // Now placeToDeactivate becomes inactive and placeToDelete is soft-deleted
        $placeToDeactivate->update(['status' => 'inactive']);
        $placeToDelete->delete();

        $response = $this->actingAs($this->userA)->getJson('/api/favorites');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->activePlace1->id)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'short_description',
                        'categories',
                        'distance_km',
                        'entrance_fee',
                        'opening_hours',
                        'first_image_url',
                        'image_url',
                        'average_rating',
                        'latitude',
                        'longitude',
                    ],
                ],
                'total',
            ]);

        // Verify /api/favorites/ids also excludes inactive/deleted
        $idsResponse = $this->actingAs($this->userA)->getJson('/api/favorites/ids');
        $idsResponse->assertOk()
            ->assertExactJson([
                'data' => [$this->activePlace1->id],
                'ids'  => [$this->activePlace1->id],
            ]);
    }
}

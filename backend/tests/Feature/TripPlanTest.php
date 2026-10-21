<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\PlanItem;
use App\Models\User;
use App\Models\VisitPlan;
use App\Services\DistanceService;
use App\Services\TripPlanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripPlanTest extends TestCase
{
    use RefreshDatabase;

    private User $userA;
    private User $userB;
    private DistanceService $distanceService;

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

        $this->distanceService = new DistanceService();
    }

    /**
     * Requirement: Guests get 401 on all visit planner routes.
     */
    public function test_guests_get_401_on_all_trip_routes(): void
    {
        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        $item = PlanItem::factory()->create(['visit_plan_id' => $plan->id]);

        $this->getJson('/api/trip')->assertStatus(401);
        $this->postJson('/api/trip', ['plan_name' => 'Guest Trip'])->assertStatus(401);
        $this->getJson("/api/trip/{$plan->id}")->assertStatus(401);
        $this->putJson("/api/trip/{$plan->id}", ['plan_name' => 'Updated'])->assertStatus(401);
        $this->deleteJson("/api/trip/{$plan->id}")->assertStatus(401);
        $this->postJson("/api/trip/{$plan->id}/items", ['attraction_id' => 1])->assertStatus(401);
        $this->deleteJson("/api/trip/{$plan->id}/items/{$item->id}")->assertStatus(401);
        $this->putJson("/api/trip/{$plan->id}/reorder", ['item_ids' => [$item->id]])->assertStatus(401);
    }

    /**
     * Requirement: User A cannot read, edit, or delete User B's plan (returns 404, not 403, preventing ID leakage).
     */
    public function test_user_a_cannot_read_edit_or_delete_user_b_plan_returns_404(): void
    {
        $planB = VisitPlan::factory()->create([
            'user_id'   => $this->userB->id,
            'plan_name' => "User B Secret Plan",
        ]);
        $itemB = PlanItem::factory()->create(['visit_plan_id' => $planB->id]);

        $attraction = Attraction::factory()->create(['status' => 'active']);

        // 1. Read attempt
        $readResp = $this->actingAs($this->userA)->getJson("/api/trip/{$planB->id}");
        $readResp->assertStatus(404);

        // 2. Edit attempt (PUT /api/trip/{id})
        $editResp = $this->actingAs($this->userA)->putJson("/api/trip/{$planB->id}", [
            'plan_name' => 'Hacked Plan Name',
        ]);
        $editResp->assertStatus(404);

        // 3. Delete attempt (DELETE /api/trip/{id})
        $deleteResp = $this->actingAs($this->userA)->deleteJson("/api/trip/{$planB->id}");
        $deleteResp->assertStatus(404);

        // 4. Add item attempt
        $addItemResp = $this->actingAs($this->userA)->postJson("/api/trip/{$planB->id}/items", [
            'attraction_id' => $attraction->id,
        ]);
        $addItemResp->assertStatus(404);

        // 5. Delete item attempt
        $delItemResp = $this->actingAs($this->userA)->deleteJson("/api/trip/{$planB->id}/items/{$itemB->id}");
        $delItemResp->assertStatus(404);

        // 6. Reorder attempt
        $reorderResp = $this->actingAs($this->userA)->putJson("/api/trip/{$planB->id}/reorder", [
            'item_ids' => [$itemB->id],
        ]);
        $reorderResp->assertStatus(404);

        // Ensure User B's plan was not modified or deleted
        $this->assertDatabaseHas('visit_plans', [
            'id'        => $planB->id,
            'plan_name' => "User B Secret Plan",
        ]);
    }

    /**
     * Requirement: User can list only their own plans.
     */
    public function test_user_can_list_only_own_plans(): void
    {
        VisitPlan::factory()->count(2)->create(['user_id' => $this->userA->id]);
        VisitPlan::factory()->count(3)->create(['user_id' => $this->userB->id]);

        $response = $this->actingAs($this->userA)->getJson('/api/trip');

        $response->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Requirement: Duplicate places are rejected (in creation, update, and adding item).
     */
    public function test_duplicate_places_are_rejected(): void
    {
        $attraction = Attraction::factory()->create(['status' => 'active']);

        // 1. In POST /api/trip
        $storeResp = $this->actingAs($this->userA)->postJson('/api/trip', [
            'plan_name'      => 'Duplicate Test Plan',
            'attraction_ids' => [$attraction->id, $attraction->id],
        ]);
        $storeResp->assertStatus(422)
            ->assertJsonValidationErrors(['attraction_ids.0']);

        // 2. In POST /api/trip/{id}/items
        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $attraction->id,
            'sequence'      => 1,
        ]);

        $appendResp = $this->actingAs($this->userA)->postJson("/api/trip/{$plan->id}/items", [
            'attraction_id' => $attraction->id,
        ]);
        $appendResp->assertStatus(422)
            ->assertJsonValidationErrors(['attraction_id']);

        // 3. In PUT /api/trip/{id} with duplicate items
        $updateResp = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}", [
            'items' => [
                ['attraction_id' => $attraction->id],
                ['attraction_id' => $attraction->id],
            ],
        ]);
        $updateResp->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.attraction_id']);
    }

    /**
     * Requirement: 13th item is rejected (max 12 items allowed per plan).
     */
    public function test_13th_item_is_rejected(): void
    {
        $attractions = Attraction::factory()->count(13)->create(['status' => 'active']);
        $first12Ids = $attractions->take(12)->pluck('id')->all();
        $thirteenthId = $attractions->last()->id;

        // 1. In POST /api/trip with 13 items
        $all13Ids = $attractions->pluck('id')->all();
        $createResp = $this->actingAs($this->userA)->postJson('/api/trip', [
            'plan_name'      => 'Too Many Places',
            'attraction_ids' => $all13Ids,
        ]);
        $createResp->assertStatus(422)
            ->assertJsonValidationErrors(['attraction_ids']);

        // 2. In POST /api/trip/{id}/items when plan already has 12 items
        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        foreach ($first12Ids as $index => $attId) {
            PlanItem::factory()->create([
                'visit_plan_id' => $plan->id,
                'attraction_id' => $attId,
                'sequence'      => $index + 1,
            ]);
        }
        $this->assertEquals(12, $plan->items()->count());

        $add13thResp = $this->actingAs($this->userA)->postJson("/api/trip/{$plan->id}/items", [
            'attraction_id' => $thirteenthId,
        ]);
        $add13thResp->assertStatus(422)
            ->assertJsonValidationErrors(['attraction_id']);

        // 3. In PUT /api/trip/{id} with 13 items
        $itemsPayload = array_map(fn ($id) => ['attraction_id' => $id], $all13Ids);
        $put13thResp = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}", [
            'items' => $itemsPayload,
        ]);
        $put13thResp->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    /**
     * Requirement: Visit date in past is rejected.
     */
    public function test_visit_date_in_past_is_rejected(): void
    {
        $response = $this->actingAs($this->userA)->postJson('/api/trip', [
            'plan_name'  => 'Past Trip',
            'visit_date' => now()->subDay()->format('Y-m-d'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['visit_date']);
    }

    /**
     * Requirement: Reorder with wrong IDs is rejected.
     */
    public function test_reorder_with_wrong_ids_rejected(): void
    {
        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        $item1 = PlanItem::factory()->create(['visit_plan_id' => $plan->id, 'sequence' => 1]);
        $item2 = PlanItem::factory()->create(['visit_plan_id' => $plan->id, 'sequence' => 2]);

        $otherPlan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        $foreignItem = PlanItem::factory()->create(['visit_plan_id' => $otherPlan->id, 'sequence' => 1]);

        // 1. Missing an item ID
        $respMissing = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}/reorder", [
            'item_ids' => [$item1->id],
        ]);
        $respMissing->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids']);

        // 2. Foreign item ID
        $respForeign = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}/reorder", [
            'item_ids' => [$item1->id, $foreignItem->id],
        ]);
        $respForeign->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids']);

        // 3. Duplicate IDs in reorder request
        $respDuplicate = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}/reorder", [
            'item_ids' => [$item1->id, $item1->id],
        ]);
        $respDuplicate->assertStatus(422)
            ->assertJsonValidationErrors(['item_ids.0']);

        // 4. Valid reorder succeeds
        $respValid = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}/reorder", [
            'item_ids' => [$item2->id, $item1->id],
        ]);
        $respValid->assertOk();

        $this->assertEquals(1, $item2->fresh()->sequence);
        $this->assertEquals(2, $item1->fresh()->sequence);
    }

    /**
     * Requirement: Removing an item renumbers sequences to 1..n.
     */
    public function test_removing_an_item_renumbers_sequences(): void
    {
        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);
        $item1 = PlanItem::factory()->create(['visit_plan_id' => $plan->id, 'sequence' => 1]);
        $item2 = PlanItem::factory()->create(['visit_plan_id' => $plan->id, 'sequence' => 2]);
        $item3 = PlanItem::factory()->create(['visit_plan_id' => $plan->id, 'sequence' => 3]);

        // Remove the middle item (item2)
        $response = $this->actingAs($this->userA)->deleteJson("/api/trip/{$plan->id}/items/{$item2->id}");
        $response->assertOk();

        // Verify remaining items are now sequence 1 and 2
        $this->assertDatabaseMissing('plan_items', ['id' => $item2->id]);
        $this->assertEquals(1, $item1->fresh()->sequence);
        $this->assertEquals(2, $item3->fresh()->sequence);
    }

    /**
     * Requirement: Distance values are correct for two known coordinates,
     * including estimated_minutes, total calculations, and the mandatory disclaimer.
     */
    public function test_distance_values_are_correct_for_two_known_coordinates(): void
    {
        // Place 1: Panadura Clock Tower
        $place1 = Attraction::factory()->create([
            'name'          => 'Panadura Clock Tower',
            'latitude'      => 6.7133,
            'longitude'     => 79.9026,
            'opening_hours' => 'Open 24 hours',
            'status'        => 'active',
        ]);

        // Place 2: Richmond Castle Kalutara
        $place2 = Attraction::factory()->create([
            'name'          => 'Richmond Castle Kalutara',
            'latitude'      => 6.5840,
            'longitude'     => 79.9710,
            'opening_hours' => '08:30 - 16:30 Daily',
            'status'        => 'active',
        ]);

        $expectedRawDist = $this->distanceService->calculateDistance(6.7133, 79.9026, 6.5840, 79.9710);
        $expectedDistKm = round($expectedRawDist, 1);
        $speed = (float) config('westerntrails.average_speed_kmh', 30);
        $expectedMinutes = (int) round(($expectedDistKm / $speed) * 60);

        $plan = VisitPlan::factory()->create([
            'user_id'    => $this->userA->id,
            'plan_name'  => 'South Coast Trail',
            'visit_date' => now()->addDays(2)->format('Y-m-d'),
        ]);

        PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $place1->id,
            'sequence'      => 1,
            'start_time'    => '09:00:00',
            'notes'         => 'Meet at the clock tower',
        ]);

        PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $place2->id,
            'sequence'      => 2,
            'start_time'    => '11:00:00',
            'notes'         => 'Castle exploration',
        ]);

        $response = $this->actingAs($this->userA)->getJson("/api/trip/{$plan->id}");

        $response->assertOk()
            ->assertJsonPath('data.plan_name', 'South Coast Trail')
            ->assertJsonPath('data.items_count', 2)
            ->assertJsonPath('data.total_distance_km', $expectedDistKm)
            ->assertJsonPath('data.total_estimated_travel_minutes', $expectedMinutes)
            ->assertJsonPath('data.disclaimer', TripPlanService::DISCLAIMER)
            ->assertJsonPath('data.items.0.start_time', '09:00:00')
            ->assertJsonPath('data.items.0.notes', 'Meet at the clock tower')
            ->assertJsonPath('data.items.0.opening_hours', 'Open 24 hours')
            ->assertJsonPath('data.items.0.visit_hours_hint', 'Open 24 hours')
            ->assertJsonPath('data.items.0.leg_to_next.distance_km', $expectedDistKm)
            ->assertJsonPath('data.items.0.leg_to_next.estimated_minutes', $expectedMinutes)
            ->assertJsonPath('data.items.1.start_time', '11:00:00')
            ->assertJsonPath('data.items.1.notes', 'Castle exploration')
            ->assertJsonPath('data.items.1.leg_to_next', null);
    }

    /**
     * Requirement: If an attraction in a saved plan later becomes inactive or deleted,
     * keep the plan working: return that item with 'unavailable': true instead of failing.
     */
    public function test_inactive_or_deleted_place_in_saved_plan_is_flagged_as_unavailable(): void
    {
        $activePlace = Attraction::factory()->create([
            'name'   => 'Active Place',
            'status' => 'active',
        ]);

        $inactivePlace = Attraction::factory()->create([
            'name'   => 'Inactive Place',
            'status' => 'inactive',
        ]);

        $deletedPlace = Attraction::factory()->create([
            'name'   => 'Deleted Place',
            'status' => 'active',
        ]);

        $plan = VisitPlan::factory()->create(['user_id' => $this->userA->id]);

        $item1 = PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $activePlace->id,
            'sequence'      => 1,
        ]);

        $item2 = PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $inactivePlace->id,
            'sequence'      => 2,
        ]);

        $item3 = PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $deletedPlace->id,
            'sequence'      => 3,
        ]);

        // Soft-delete the 3rd place
        $deletedPlace->delete();

        $response = $this->actingAs($this->userA)->getJson("/api/trip/{$plan->id}");

        $response->assertOk()
            ->assertJsonPath('data.items_count', 3)
            ->assertJsonPath('data.items.0.unavailable', false)
            ->assertJsonPath('data.items.1.unavailable', true)
            ->assertJsonPath('data.items.2.unavailable', true);
    }

    /**
     * Requirement: PUT /api/trip/{id} can rename, change date, and replace item list/order in one call.
     */
    public function test_put_trip_can_rename_change_date_and_replace_items_in_one_call(): void
    {
        $plan = VisitPlan::factory()->create([
            'user_id'    => $this->userA->id,
            'plan_name'  => 'Old Plan Name',
            'visit_date' => now()->addDays(1)->format('Y-m-d'),
        ]);

        $oldAttraction = Attraction::factory()->create(['status' => 'active']);
        PlanItem::factory()->create([
            'visit_plan_id' => $plan->id,
            'attraction_id' => $oldAttraction->id,
            'sequence'      => 1,
        ]);

        $newAttraction1 = Attraction::factory()->create(['status' => 'active']);
        $newAttraction2 = Attraction::factory()->create(['status' => 'active']);

        $newDate = now()->addDays(5)->format('Y-m-d');

        $response = $this->actingAs($this->userA)->putJson("/api/trip/{$plan->id}", [
            'plan_name'  => 'New Plan Name',
            'visit_date' => $newDate,
            'items'      => [
                [
                    'attraction_id' => $newAttraction2->id,
                    'start_time'    => '10:00:00',
                    'notes'         => 'First stop',
                ],
                [
                    'attraction_id' => $newAttraction1->id,
                    'start_time'    => '14:30:00',
                    'notes'         => 'Second stop',
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.plan_name', 'New Plan Name')
            ->assertJsonPath('data.visit_date', $newDate)
            ->assertJsonPath('data.items_count', 2)
            ->assertJsonPath('data.items.0.attraction_id', $newAttraction2->id)
            ->assertJsonPath('data.items.0.sequence', 1)
            ->assertJsonPath('data.items.0.start_time', '10:00:00')
            ->assertJsonPath('data.items.0.notes', 'First stop')
            ->assertJsonPath('data.items.1.attraction_id', $newAttraction1->id)
            ->assertJsonPath('data.items.1.sequence', 2);

        $this->assertDatabaseMissing('plan_items', [
            'visit_plan_id' => $plan->id,
            'attraction_id' => $oldAttraction->id,
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\AttractionImage;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlaceDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api/places returns only active, non-deleted places.
     */
    public function test_get_places_returns_only_active_non_deleted_places(): void
    {
        $category = Category::factory()->create(['status' => 'active']);

        $activePlace = Attraction::factory()->create(['status' => 'active']);
        $activePlace->categories()->attach($category->id);

        $inactivePlace = Attraction::factory()->create(['status' => 'inactive']);
        $inactivePlace->categories()->attach($category->id);

        $deletedPlace = Attraction::factory()->create(['status' => 'active']);
        $deletedPlace->categories()->attach($category->id);
        $deletedPlace->delete();

        $response = $this->getJson('/api/places');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $activePlace->id);
    }

    /**
     * Test q matches by name and by description, is case-insensitive, and % wildcard does not match everything.
     */
    public function test_q_matches_by_name_and_description_case_insensitively_and_percent_escaped(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $p1 = Attraction::factory()->create([
            'name'        => 'Richmond Castle',
            'description' => 'A magnificent mansion built in the colonial era.',
            'status'      => 'active',
        ]);
        $p1->categories()->attach($cat->id);

        $p2 = Attraction::factory()->create([
            'name'        => 'Bolgoda Sanctuary',
            'description' => 'Eco park featuring 100% natural wetlands and bird species.',
            'status'      => 'active',
        ]);
        $p2->categories()->attach($cat->id);

        $p3 = Attraction::factory()->create([
            'name'        => 'Panadura Beach',
            'description' => 'Scenic coastal promenade with waves and sands.',
            'status'      => 'active',
        ]);
        $p3->categories()->attach($cat->id);

        // Case-insensitive name match
        $resName = $this->getJson('/api/places?q=richmond');
        $resName->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resName->json('data.0.id'));

        // Case-insensitive description match
        $resDesc = $this->getJson('/api/places?q=COLONIAL');
        $resDesc->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resDesc->json('data.0.id'));

        // Search with literal % must NOT match everything; only matches p2 which contains "100%"
        $resPercent = $this->getJson('/api/places?q=%25');
        $resPercent->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p2->id, $resPercent->json('data.0.id'));
    }

    /**
     * Test category filter with one ID and with several IDs.
     */
    public function test_category_filter_with_one_id_and_several_ids(): void
    {
        $cat1 = Category::factory()->create(['status' => 'active', 'name' => 'Beaches']);
        $cat2 = Category::factory()->create(['status' => 'active', 'name' => 'Historical']);
        $cat3 = Category::factory()->create(['status' => 'active', 'name' => 'Nature']);

        $p1 = Attraction::factory()->create(['status' => 'active']);
        $p1->categories()->attach($cat1->id);

        $p2 = Attraction::factory()->create(['status' => 'active']);
        $p2->categories()->attach($cat2->id);

        $p3 = Attraction::factory()->create(['status' => 'active']);
        $p3->categories()->attach($cat3->id);

        // Single ID filter
        $resSingle = $this->getJson("/api/places?category={$cat1->id}");
        $resSingle->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resSingle->json('data.0.id'));

        // Several IDs filter (comma-separated, matches ANY)
        $resMulti = $this->getJson("/api/places?category={$cat1->id},{$cat2->id}");
        $resMulti->assertOk()->assertJsonCount(2, 'data');
        $ids = collect($resMulti->json('data'))->pluck('id')->all();
        $this->assertContains($p1->id, $ids);
        $this->assertContains($p2->id, $ids);
        $this->assertNotContains($p3->id, $ids);

        // Several IDs filter as array notation (?category[]=1&category[]=2)
        $resArray = $this->getJson("/api/places?category[]={$cat1->id}&category[]={$cat3->id}");
        $resArray->assertOk()->assertJsonCount(2, 'data');
        $arrayIds = collect($resArray->json('data'))->pluck('id')->all();
        $this->assertContains($p1->id, $arrayIds);
        $this->assertContains($p3->id, $arrayIds);
        $this->assertNotContains($p2->id, $arrayIds);
    }

    /**
     * Test max_distance and free filters.
     */
    public function test_max_distance_and_free_filters(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pCloseFree = Attraction::factory()->create(['distance_km' => 3.0, 'entrance_fee' => 0.0, 'status' => 'active']);
        $pCloseFree->categories()->attach($cat->id);

        $pClosePaid = Attraction::factory()->create(['distance_km' => 4.5, 'entrance_fee' => 250.0, 'status' => 'active']);
        $pClosePaid->categories()->attach($cat->id);

        $pFarFree = Attraction::factory()->create(['distance_km' => 18.0, 'entrance_fee' => 0.0, 'status' => 'active']);
        $pFarFree->categories()->attach($cat->id);

        $pFarPaid = Attraction::factory()->create(['distance_km' => 22.0, 'entrance_fee' => 500.0, 'status' => 'active']);
        $pFarPaid->categories()->attach($cat->id);

        // max_distance filter: distance <= 5 km
        $resDist = $this->getJson('/api/places?max_distance=5');
        $resDist->assertOk()->assertJsonCount(2, 'data');
        $distIds = collect($resDist->json('data'))->pluck('id')->all();
        $this->assertContains($pCloseFree->id, $distIds);
        $this->assertContains($pClosePaid->id, $distIds);
        $this->assertNotContains($pFarFree->id, $distIds);

        // free filter: only entrance_fee = 0
        $resFree = $this->getJson('/api/places?free=1');
        $resFree->assertOk()->assertJsonCount(2, 'data');
        $freeIds = collect($resFree->json('data'))->pluck('id')->all();
        $this->assertContains($pCloseFree->id, $freeIds);
        $this->assertContains($pFarFree->id, $freeIds);
        $this->assertNotContains($pClosePaid->id, $freeIds);

        // Combined max_distance and free filter
        $resBoth = $this->getJson('/api/places?max_distance=5&free=1');
        $resBoth->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pCloseFree->id, $resBoth->json('data.0.id'));
    }

    /**
     * Test every sort option returns the correct order, and invalid sort falls back to default.
     */
    public function test_every_sort_option_and_invalid_sort_fallback(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pA = Attraction::factory()->create(['name' => 'Alpha Place', 'distance_km' => 2.0, 'entrance_fee' => 300.0, 'status' => 'active']);
        $pA->categories()->attach($cat->id);

        $pB = Attraction::factory()->create(['name' => 'Beta Place', 'distance_km' => 10.0, 'entrance_fee' => 100.0, 'status' => 'active']);
        $pB->categories()->attach($cat->id);

        $pC = Attraction::factory()->create(['name' => 'Gamma Place', 'distance_km' => 6.0, 'entrance_fee' => 500.0, 'status' => 'active']);
        $pC->categories()->attach($cat->id);

        // 1. Default / distance_asc: pA (2km), pC (6km), pB (10km)
        $resDistAsc = $this->getJson('/api/places');
        $resDistAsc->assertOk();
        $this->assertEquals([$pA->id, $pC->id, $pB->id], collect($resDistAsc->json('data'))->pluck('id')->all());

        // 2. distance_desc: pB (10km), pC (6km), pA (2km)
        $resDistDesc = $this->getJson('/api/places?sort=distance_desc');
        $resDistDesc->assertOk();
        $this->assertEquals([$pB->id, $pC->id, $pA->id], collect($resDistDesc->json('data'))->pluck('id')->all());

        // 3. name_asc: Alpha, Beta, Gamma
        $resNameAsc = $this->getJson('/api/places?sort=name_asc');
        $resNameAsc->assertOk();
        $this->assertEquals([$pA->id, $pB->id, $pC->id], collect($resNameAsc->json('data'))->pluck('id')->all());

        // 4. fee_asc: pB (100), pA (300), pC (500)
        $resFeeAsc = $this->getJson('/api/places?sort=fee_asc');
        $resFeeAsc->assertOk();
        $this->assertEquals([$pB->id, $pA->id, $pC->id], collect($resFeeAsc->json('data'))->pluck('id')->all());

        // 5. rating_desc: create approved reviews
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();
        Review::create(['user_id' => $u1->id, 'attraction_id' => $pC->id, 'rating' => 5, 'status' => 'approved']);
        Review::create(['user_id' => $u2->id, 'attraction_id' => $pA->id, 'rating' => 3, 'status' => 'approved']);
        // pB has no reviews -> should be placed last

        $resRatingDesc = $this->getJson('/api/places?sort=rating_desc');
        $resRatingDesc->assertOk();
        $this->assertEquals([$pC->id, $pA->id, $pB->id], collect($resRatingDesc->json('data'))->pluck('id')->all());

        // 6. Invalid sort value falls back to default distance_asc
        $resInvalid = $this->getJson('/api/places?sort=malicious_sql_injection_attempt');
        $resInvalid->assertOk();
        $this->assertEquals('distance_asc', $resInvalid->json('filters.sort'));
        $this->assertEquals([$pA->id, $pC->id, $pB->id], collect($resInvalid->json('data'))->pluck('id')->all());
    }

    /**
     * Test invalid parameters return 422 with clear messages.
     */
    public function test_invalid_parameters_return_422(): void
    {
        // Negative distance
        $this->getJson('/api/places?max_distance=-5')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['max_distance']);

        // Non-numeric category
        $this->getJson('/api/places?category=not_numeric')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category']);

        // Non-numeric category in list
        $this->getJson('/api/places?category=1,foo')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category']);

        // Negative max_fee
        $this->getJson('/api/places?max_fee=-10')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['max_fee']);

        // Invalid free flag
        $this->getJson('/api/places?free=invalid')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['free']);
    }

    /**
     * Test no matches returns an empty list with message (REQ-012).
     */
    public function test_no_matches_returns_empty_list_with_message(): void
    {
        $response = $this->getJson('/api/places?q=completely_non_existent_search_query_9999');

        $response->assertOk()
            ->assertJsonPath('data', [])
            ->assertJsonPath('message', 'No places match your search.')
            ->assertJsonStructure([
                'data',
                'filters',
                'message',
                'meta',
            ]);
    }

    /**
     * Test pagination: per_page above 50 is rejected with 422.
     */
    public function test_pagination_per_page_above_50_is_rejected(): void
    {
        // per_page > 50 rejected
        $this->getJson('/api/places?per_page=51')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);

        // per_page = 0 rejected
        $this->getJson('/api/places?per_page=0')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['per_page']);

        // per_page = 50 accepted
        $response = $this->getJson('/api/places?per_page=50');
        $response->assertOk()
            ->assertJsonPath('meta.per_page', 50);
    }

    /**
     * Test details endpoint: full data for an active place; 404 for deleted, inactive and missing.
     */
    public function test_details_endpoint_full_data_and_404_handling(): void
    {
        $category = Category::factory()->create(['status' => 'active']);

        $active = Attraction::factory()->create([
            'name'         => 'Kalutara Bodhiya',
            'description'  => 'Sacred Buddhist temple shrine with stupa.',
            'address'      => 'Galle Road, Kalutara',
            'latitude'     => 6.5840,
            'longitude'    => 79.9600,
            'distance_km'  => 14.5,
            'entrance_fee' => 0.0,
            'status'       => 'active',
        ]);
        $active->categories()->attach($category->id);

        AttractionImage::factory()->create([
            'attraction_id' => $active->id,
            'image_path'    => 'places/1/temple.jpg',
            'caption'       => 'Main Shrine',
        ]);

        $inactive = Attraction::factory()->create(['status' => 'inactive']);
        $inactive->categories()->attach($category->id);

        $deleted = Attraction::factory()->create(['status' => 'active']);
        $deleted->categories()->attach($category->id);
        $deleted->delete();

        // 1. Active place returns full PlaceDetailResource
        $resActive = $this->getJson("/api/places/{$active->id}");
        $resActive->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'categories',
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
                    'images',
                    'average_rating',
                    'reviews_count',
                    'nearby',
                ],
            ]);

        $this->assertEquals('Kalutara Bodhiya', $resActive->json('data.name'));
        $this->assertTrue($resActive->json('data.is_free'));
        $this->assertNotEmpty($resActive->json('data.images'));

        // Internal fields must NOT be present
        $this->assertArrayNotHasKey('created_at', $resActive->json('data'));
        $this->assertArrayNotHasKey('deleted_at', $resActive->json('data'));
        $this->assertArrayNotHasKey('status', $resActive->json('data'));

        // 2. Inactive place -> 404
        $this->getJson("/api/places/{$inactive->id}")
            ->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);

        // 3. Deleted place -> 404
        $this->getJson("/api/places/{$deleted->id}")
            ->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);

        // 4. Missing place -> 404
        $this->getJson('/api/places/999999')
            ->assertStatus(404)
            ->assertExactJson(['message' => 'Place not found.']);
    }

    /**
     * Test nearby list excludes the place itself and respects the 5 km limit.
     */
    public function test_nearby_list_excludes_self_and_respects_5km_limit(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        // Center place at Panadura
        $center = Attraction::factory()->create([
            'name'      => 'Center Place',
            'latitude'  => 6.7132,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $center->categories()->attach($cat->id);

        // Near 1 (~1.0 km)
        $near1 = Attraction::factory()->create([
            'name'      => 'Near 1',
            'latitude'  => 6.7200,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $near1->categories()->attach($cat->id);

        // Near 2 (~3.0 km)
        $near2 = Attraction::factory()->create([
            'name'      => 'Near 2',
            'latitude'  => 6.7350,
            'longitude' => 79.9074,
            'status'    => 'active',
        ]);
        $near2->categories()->attach($cat->id);

        // Far place (~15 km away, outside 5km limit)
        $far = Attraction::factory()->create([
            'name'      => 'Far Place Outside 5km',
            'latitude'  => 6.5800,
            'longitude' => 79.9600,
            'status'    => 'active',
        ]);
        $far->categories()->attach($cat->id);

        $response = $this->getJson("/api/places/{$center->id}");
        $response->assertOk();

        $nearby = $response->json('data.nearby');
        $this->assertIsArray($nearby);
        $this->assertCount(2, $nearby);

        $nearbyIds = collect($nearby)->pluck('id')->all();

        // Must exclude center place itself
        $this->assertNotContains($center->id, $nearbyIds);

        // Must include near1 and near2
        $this->assertContains($near1->id, $nearbyIds);
        $this->assertContains($near2->id, $nearbyIds);

        // Must exclude far place > 5 km
        $this->assertNotContains($far->id, $nearbyIds);

        // Distances must be <= 5.0
        foreach ($nearby as $item) {
            $this->assertLessThanOrEqual(5.0, $item['distance_from_here_km']);
        }
    }

    /**
     * Test SQL queries count on list endpoint does not grow with number of places (N+1 check).
     */
    public function test_query_count_does_not_grow_with_number_of_places_n_plus_one_check(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        // Case 1: 2 places
        $placesBatch1 = Attraction::factory()->count(2)->create(['status' => 'active']);
        foreach ($placesBatch1 as $p) {
            $p->categories()->attach($cat->id);
            AttractionImage::factory()->create(['attraction_id' => $p->id]);
        }

        DB::flushQueryLog();
        DB::enableQueryLog();

        $res1 = $this->getJson('/api/places');
        $res1->assertOk()->assertJsonCount(2, 'data');

        $queryCount1 = count(DB::getQueryLog());

        // Case 2: Add 8 more places (10 places total)
        $placesBatch2 = Attraction::factory()->count(8)->create(['status' => 'active']);
        foreach ($placesBatch2 as $p) {
            $p->categories()->attach($cat->id);
            AttractionImage::factory()->create(['attraction_id' => $p->id]);
        }

        DB::flushQueryLog();
        DB::enableQueryLog();

        $res2 = $this->getJson('/api/places?per_page=15');
        $res2->assertOk()->assertJsonCount(10, 'data');

        $queryCount2 = count(DB::getQueryLog());

        // Query count for 10 places must be equal to query count for 2 places (O(1) database queries, no N+1)
        $this->assertEquals(
            $queryCount1,
            $queryCount2,
            "Query count increased from {$queryCount1} to {$queryCount2}. N+1 query detected!"
        );
    }
}

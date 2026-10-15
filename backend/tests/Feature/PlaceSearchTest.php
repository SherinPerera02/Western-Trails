<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\AttractionImage;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlaceSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test public places list returns active, non-deleted places with light resource structure.
     */
    public function test_public_places_list_returns_active_places_with_light_resource(): void
    {
        $category = Category::factory()->create(['status' => 'active', 'name' => 'Coastal & Beach']);
        $place = Attraction::factory()->create([
            'name'         => 'Panadura Beach Park',
            'description'  => 'A scenic coastal beach park with golden sands and evening food vendors along the shore.',
            'distance_km'  => 1.5,
            'entrance_fee' => 0.0,
            'status'       => 'active',
        ]);
        $place->categories()->attach($category->id);

        AttractionImage::factory()->create([
            'attraction_id' => $place->id,
            'image_path'    => 'places/1/test_beach.jpg',
            'caption'       => 'Beach Sunset',
        ]);

        // Inactive place should be excluded
        $inactivePlace = Attraction::factory()->create(['status' => 'inactive']);
        $inactivePlace->categories()->attach($category->id);

        // Soft-deleted place should be excluded
        $deletedPlace = Attraction::factory()->create(['status' => 'active']);
        $deletedPlace->categories()->attach($category->id);
        $deletedPlace->delete();

        $response = $this->getJson('/api/places');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
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
                'links',
                'meta',
                'filters',
            ]);

        $item = $response->json('data.0');
        $this->assertEquals($place->id, $item['id']);
        $this->assertEquals('Panadura Beach Park', $item['name']);
        $this->assertNotEmpty($item['short_description']);
        $this->assertStringContainsString('storage/places/1/test_beach.jpg', $item['first_image_url']);
        $this->assertEquals('distance_asc', $response->json('filters.sort'));
    }

    /**
     * Test search parameter q matches name, description, address, and activities case-insensitively.
     */
    public function test_search_q_matches_various_fields_case_insensitively(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $p1 = Attraction::factory()->create([
            'name'        => 'Richmond Castle',
            'description' => 'Historic British mansion with garden',
            'address'     => 'Kalutara South',
            'activities'  => 'Architecture photography, garden walking',
            'status'      => 'active',
        ]);
        $p1->categories()->attach($cat->id);

        $p2 = Attraction::factory()->create([
            'name'        => 'Bolgoda Lake Sanctuary',
            'description' => 'Freshwater lake teeming with wetland birds',
            'address'     => 'Moratuwa-Panadura border',
            'activities'  => 'Kayaking, birdwatching',
            'status'      => 'active',
        ]);
        $p2->categories()->attach($cat->id);

        // Match name
        $resName = $this->getJson('/api/places?q=richmond');
        $resName->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resName->json('data.0.id'));

        // Match description
        $resDesc = $this->getJson('/api/places?q=freshwater');
        $resDesc->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p2->id, $resDesc->json('data.0.id'));

        // Match address
        $resAddr = $this->getJson('/api/places?q=kalutara');
        $resAddr->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resAddr->json('data.0.id'));

        // Match activities
        $resAct = $this->getJson('/api/places?q=kayaking');
        $resAct->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p2->id, $resAct->json('data.0.id'));
    }

    /**
     * Test search parameter q escapes % and _ wildcards and handles special characters like single quotes.
     */
    public function test_search_q_escapes_wildcards_and_handles_special_characters(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pSpecial = Attraction::factory()->create([
            'name'        => "St. John's 100% Organic Tea Estate",
            'description' => 'A special place with a 50% discount and test_item code',
            'status'      => 'active',
        ]);
        $pSpecial->categories()->attach($cat->id);

        $pNormal = Attraction::factory()->create([
            'name'        => 'Standard Park',
            'description' => 'Normal plain park',
            'status'      => 'active',
        ]);
        $pNormal->categories()->attach($cat->id);

        // Searching for % should literally match 100% and not treat % as match-all
        $resPercent = $this->getJson('/api/places?q=%25'); // URL-encoded %
        $resPercent->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pSpecial->id, $resPercent->json('data.0.id'));

        // Searching for _ should literally match test_item
        $resUnderscore = $this->getJson('/api/places?q=_item');
        $resUnderscore->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pSpecial->id, $resUnderscore->json('data.0.id'));

        // Searching for single quote ' should match safely without SQL errors
        $resQuote = $this->getJson("/api/places?q=John's");
        $resQuote->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pSpecial->id, $resQuote->json('data.0.id'));
    }

    /**
     * Test empty search returns all active places.
     */
    public function test_empty_search_returns_all_places(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);
        Attraction::factory()->count(3)->create(['status' => 'active'])->each(fn (Attraction $p) => $p->categories()->attach($cat->id));

        $res = $this->getJson('/api/places?q=');
        $res->assertOk()->assertJsonCount(3, 'data');
    }

    /**
     * Test category filter by single ID, comma-separated list, and inactive category restriction.
     */
    public function test_category_filter_matches_any_and_respects_active_categories(): void
    {
        $catActive1 = Category::factory()->create(['status' => 'active']);
        $catActive2 = Category::factory()->create(['status' => 'active']);
        $catInactive = Category::factory()->create(['status' => 'inactive']);

        $p1 = Attraction::factory()->create(['status' => 'active']);
        $p1->categories()->attach($catActive1->id);

        $p2 = Attraction::factory()->create(['status' => 'active']);
        $p2->categories()->attach($catActive2->id);

        $p3 = Attraction::factory()->create(['status' => 'active']);
        $p3->categories()->attach($catInactive->id);

        // Filter by single category
        $resSingle = $this->getJson("/api/places?category={$catActive1->id}");
        $resSingle->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($p1->id, $resSingle->json('data.0.id'));

        // Filter by comma-separated categories (matches ANY)
        $resMulti = $this->getJson("/api/places?category={$catActive1->id},{$catActive2->id}");
        $resMulti->assertOk()->assertJsonCount(2, 'data');

        // Filter by inactive category returns 0 places (BR-005)
        $resInactive = $this->getJson("/api/places?category={$catInactive->id}");
        $resInactive->assertOk()->assertJsonCount(0, 'data')
            ->assertJsonPath('message', 'No places match your search.');
    }

    /**
     * Test invalid category IDs return 422.
     */
    public function test_invalid_category_returns_422(): void
    {
        $this->getJson('/api/places?category=abc')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category']);

        $this->getJson('/api/places?category=1,xyz')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    /**
     * Test max_distance filter.
     */
    public function test_max_distance_filter(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pClose = Attraction::factory()->create(['distance_km' => 5.0, 'status' => 'active']);
        $pClose->categories()->attach($cat->id);

        $pFar = Attraction::factory()->create(['distance_km' => 22.0, 'status' => 'active']);
        $pFar->categories()->attach($cat->id);

        $res = $this->getJson('/api/places?max_distance=10');
        $res->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pClose->id, $res->json('data.0.id'));

        // Invalid max distance returns 422
        $this->getJson('/api/places?max_distance=-5')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['max_distance']);
    }

    /**
     * Test max_fee and free filters.
     */
    public function test_max_fee_and_free_filters(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pFree = Attraction::factory()->create(['entrance_fee' => 0.0, 'status' => 'active']);
        $pFree->categories()->attach($cat->id);

        $pCheap = Attraction::factory()->create(['entrance_fee' => 150.0, 'status' => 'active']);
        $pCheap->categories()->attach($cat->id);

        $pExpensive = Attraction::factory()->create(['entrance_fee' => 1500.0, 'status' => 'active']);
        $pExpensive->categories()->attach($cat->id);

        $pNull = Attraction::factory()->create(['entrance_fee' => null, 'status' => 'active']);
        $pNull->categories()->attach($cat->id);

        // free=1: only entrance_fee = 0
        $resFree = $this->getJson('/api/places?free=1');
        $resFree->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pFree->id, $resFree->json('data.0.id'));

        // max_fee=200: entrance_fee <= 200, entrance_fee IS NULL is excluded
        $resMaxFee = $this->getJson('/api/places?max_fee=200');
        $resMaxFee->assertOk()->assertJsonCount(2, 'data'); // 0 and 150
        $ids = collect($resMaxFee->json('data'))->pluck('id')->all();
        $this->assertContains($pFree->id, $ids);
        $this->assertContains($pCheap->id, $ids);
        $this->assertNotContains($pExpensive->id, $ids);
        $this->assertNotContains($pNull->id, $ids);

        // Invalid max_fee returns 422
        $this->getJson('/api/places?max_fee=-20')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['max_fee']);
    }

    /**
     * Test sorting options: distance_asc, distance_desc, name_asc, fee_asc, bad sort fallback.
     */
    public function test_sorting_options_and_bad_sort_fallback(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pB = Attraction::factory()->create(['name' => 'B Beach', 'distance_km' => 10.0, 'entrance_fee' => 200.0, 'status' => 'active']);
        $pB->categories()->attach($cat->id);

        $pA = Attraction::factory()->create(['name' => 'A Temple', 'distance_km' => 2.0, 'entrance_fee' => 50.0, 'status' => 'active']);
        $pA->categories()->attach($cat->id);

        $pC = Attraction::factory()->create(['name' => 'C Park', 'distance_km' => 15.0, 'entrance_fee' => 500.0, 'status' => 'active']);
        $pC->categories()->attach($cat->id);

        // Default: distance_asc
        $resDef = $this->getJson('/api/places');
        $resDef->assertOk();
        $this->assertEquals([$pA->id, $pB->id, $pC->id], collect($resDef->json('data'))->pluck('id')->all());

        // distance_desc
        $resDistDesc = $this->getJson('/api/places?sort=distance_desc');
        $resDistDesc->assertOk();
        $this->assertEquals([$pC->id, $pB->id, $pA->id], collect($resDistDesc->json('data'))->pluck('id')->all());

        // name_asc
        $resName = $this->getJson('/api/places?sort=name_asc');
        $resName->assertOk();
        $this->assertEquals([$pA->id, $pB->id, $pC->id], collect($resName->json('data'))->pluck('id')->all());

        // fee_asc
        $resFee = $this->getJson('/api/places?sort=fee_asc');
        $resFee->assertOk();
        $this->assertEquals([$pA->id, $pB->id, $pC->id], collect($resFee->json('data'))->pluck('id')->all());

        // Bad sort value silently falls back to distance_asc without error
        $resBad = $this->getJson('/api/places?sort=non_existent_sort_value');
        $resBad->assertOk();
        $this->assertEquals([$pA->id, $pB->id, $pC->id], collect($resBad->json('data'))->pluck('id')->all());
        $this->assertEquals('distance_asc', $resBad->json('filters.sort'));
    }

    /**
     * Test rating_desc sort with approved reviews, places with no reviews going last, and silent fallback if reviews empty.
     */
    public function test_rating_desc_sort_and_silent_fallback_when_empty(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);

        $pHigh = Attraction::factory()->create(['distance_km' => 12.0, 'status' => 'active']);
        $pHigh->categories()->attach($cat->id);

        $pLow = Attraction::factory()->create(['distance_km' => 5.0, 'status' => 'active']);
        $pLow->categories()->attach($cat->id);

        $pNoReviews = Attraction::factory()->create(['distance_km' => 2.0, 'status' => 'active']);
        $pNoReviews->categories()->attach($cat->id);

        // When reviews table is empty, rating_desc should silently fall back to distance_asc
        $resEmpty = $this->getJson('/api/places?sort=rating_desc');
        $resEmpty->assertOk();
        $this->assertEquals('distance_asc', $resEmpty->json('filters.sort'));
        $this->assertEquals([$pNoReviews->id, $pLow->id, $pHigh->id], collect($resEmpty->json('data'))->pluck('id')->all());

        // Now create approved reviews
        $u1 = User::factory()->create();
        $u2 = User::factory()->create();
        $u3 = User::factory()->create();

        // pHigh gets avg 5.0
        Review::create(['user_id' => $u1->id, 'attraction_id' => $pHigh->id, 'rating' => 5, 'status' => 'approved']);

        // pLow gets avg 3.0 (from 3 and 3)
        Review::create(['user_id' => $u1->id, 'attraction_id' => $pLow->id, 'rating' => 3, 'status' => 'approved']);

        // Add a rejected review that should be ignored
        Review::create(['user_id' => $u2->id, 'attraction_id' => $pLow->id, 'rating' => 1, 'status' => 'rejected']);

        // Add a pending review that should be ignored
        Review::create(['user_id' => $u3->id, 'attraction_id' => $pNoReviews->id, 'rating' => 5, 'status' => 'pending']);

        // Request with rating_desc
        $resRating = $this->getJson('/api/places?sort=rating_desc');
        $resRating->assertOk();
        $this->assertEquals('rating_desc', $resRating->json('filters.sort'));

        // pHigh (5.0) first, pLow (3.0) second, pNoReviews (null) LAST
        $ids = collect($resRating->json('data'))->pluck('id')->all();
        $this->assertEquals([$pHigh->id, $pLow->id, $pNoReviews->id], $ids);

        // Check average_rating field
        $this->assertEquals(5.0, $resRating->json('data.0.average_rating'));
        $this->assertEquals(3.0, $resRating->json('data.1.average_rating'));
        $this->assertNull($resRating->json('data.2.average_rating'));
    }

    /**
     * Test REQ-012: Empty results return 200 with empty data array and message.
     */
    public function test_empty_results_return_200_with_message(): void
    {
        $res = $this->getJson('/api/places?q=absolutely_non_existent_query_term_12345');

        $res->assertOk()
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
     * Test combined filters: q + category + max_distance.
     */
    public function test_combined_filters(): void
    {
        $catBeach = Category::factory()->create(['name' => 'Beach', 'status' => 'active']);
        $catTemple = Category::factory()->create(['name' => 'Temple', 'status' => 'active']);

        // Matches all: name has "sunset", in Beach, distance 8km <= 15km
        $pMatch = Attraction::factory()->create([
            'name'        => 'Sunset Beach Panadura',
            'distance_km' => 8.0,
            'status'      => 'active',
        ]);
        $pMatch->categories()->attach($catBeach->id);

        // Has "sunset" and distance 5km, but wrong category (Temple)
        $pWrongCat = Attraction::factory()->create([
            'name'        => 'Sunset Temple Meditation',
            'distance_km' => 5.0,
            'status'      => 'active',
        ]);
        $pWrongCat->categories()->attach($catTemple->id);

        // Has "sunset" and in Beach, but distance 20km > 15km
        $pTooFar = Attraction::factory()->create([
            'name'        => 'Sunset Beach Kalutara',
            'distance_km' => 20.0,
            'status'      => 'active',
        ]);
        $pTooFar->categories()->attach($catBeach->id);

        $res = $this->getJson("/api/places?q=sunset&category={$catBeach->id}&max_distance=15");

        $res->assertOk()->assertJsonCount(1, 'data');
        $this->assertEquals($pMatch->id, $res->json('data.0.id'));
        $this->assertEquals('sunset', $res->json('filters.q'));
        $this->assertEquals((string) $catBeach->id, $res->json('filters.category'));
        $this->assertEquals(15.0, $res->json('filters.max_distance'));
    }

    /**
     * Test GET /api/places/filters endpoint returns categories with place counts, min/max distance, max fee.
     */
    public function test_places_filters_endpoint_returns_filter_ui_metadata(): void
    {
        $cat1 = Category::factory()->create(['name' => 'Beaches', 'status' => 'active']);
        $cat2 = Category::factory()->create(['name' => 'Temples', 'status' => 'active']);
        $catInactive = Category::factory()->create(['name' => 'Inactive Cat', 'status' => 'inactive']);

        $p1 = Attraction::factory()->create([
            'distance_km'  => 2.5,
            'entrance_fee' => 0.0,
            'status'       => 'active',
        ]);
        $p1->categories()->attach([$cat1->id, $cat2->id]);

        $p2 = Attraction::factory()->create([
            'distance_km'  => 18.0,
            'entrance_fee' => 750.0,
            'status'       => 'active',
        ]);
        $p2->categories()->attach($cat1->id);

        // Inactive place should NOT count in category count or min/max metrics
        $pInactive = Attraction::factory()->create([
            'distance_km'  => 50.0,
            'entrance_fee' => 5000.0,
            'status'       => 'inactive',
        ]);
        $pInactive->categories()->attach($cat1->id);

        $res = $this->getJson('/api/places/filters');

        $res->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'categories' => [
                        '*' => ['id', 'name', 'places_count', 'count'],
                    ],
                    'min_distance',
                    'max_distance',
                    'max_fee',
                ],
            ]);

        // Check active categories only
        $categories = collect($res->json('data.categories'));
        $this->assertFalse($categories->contains('id', $catInactive->id));

        $beachCat = $categories->firstWhere('id', $cat1->id);
        $this->assertEquals(2, $beachCat['places_count']);

        $templeCat = $categories->firstWhere('id', $cat2->id);
        $this->assertEquals(1, $templeCat['places_count']);

        // Metrics
        $this->assertEquals(2.5, $res->json('data.min_distance'));
        $this->assertEquals(18.0, $res->json('data.max_distance'));
        $this->assertEquals(750.0, $res->json('data.max_fee'));
    }
}

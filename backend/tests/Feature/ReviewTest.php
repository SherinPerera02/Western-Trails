<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $tourist;
    private User $admin;
    private Attraction $place;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tourist = User::factory()->create([
            'role'   => 'tourist',
            'status' => 'active',
        ]);

        $this->admin = User::factory()->create([
            'role'   => 'admin',
            'status' => 'active',
        ]);

        $category = Category::factory()->create(['name' => 'Beach', 'status' => 'active']);
        $this->place = Attraction::factory()->create([
            'name'        => 'Panadura Beach',
            'status'      => 'active',
            'latitude'    => 6.7118,
            'longitude'   => 79.9018,
            'distance_km' => 0.2,
        ]);
        $this->place->categories()->attach($category);
    }

    public function test_guest_can_view_reviews_for_a_place(): void
    {
        Review::factory()->create([
            'attraction_id' => $this->place->id,
            'user_id'       => $this->tourist->id,
            'rating'        => 5,
            'comment'       => 'Stunning sunset and calm breeze.',
            'status'        => 'approved',
        ]);

        $res = $this->getJson("/api/places/{$this->place->id}/reviews");
        $res->assertStatus(200)
            ->assertJsonPath('reviews_count', 1)
            ->assertJsonPath('average_rating', 5)
            ->assertJsonPath('data.0.comment', 'Stunning sunset and calm breeze.');
    }

    public function test_guest_cannot_submit_review(): void
    {
        $res = $this->postJson("/api/places/{$this->place->id}/reviews", [
            'rating'  => 5,
            'comment' => 'Nice place',
        ]);

        $res->assertStatus(401);
    }

    public function test_authenticated_tourist_can_submit_valid_review(): void
    {
        $res = $this->actingAs($this->tourist)
            ->postJson("/api/places/{$this->place->id}/reviews", [
                'rating'  => 4,
                'comment' => 'Clean beach and good walking path.',
            ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.comment', 'Clean beach and good walking path.')
            ->assertJsonPath('average_rating', 4);

        $this->assertDatabaseHas('reviews', [
            'user_id'       => $this->tourist->id,
            'attraction_id' => $this->place->id,
            'rating'        => 4,
            'status'        => 'approved',
        ]);
    }

    public function test_review_validation_rejects_invalid_rating(): void
    {
        $res = $this->actingAs($this->tourist)
            ->postJson("/api/places/{$this->place->id}/reviews", [
                'rating'  => 6, // exceeds 5
                'comment' => 'Invalid star',
            ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);

        $resZero = $this->actingAs($this->tourist)
            ->postJson("/api/places/{$this->place->id}/reviews", [
                'rating' => 0, // below 1
            ]);

        $resZero->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    }

    public function test_user_updating_review_updates_existing_record_idempotently(): void
    {
        $this->actingAs($this->tourist)
            ->postJson("/api/places/{$this->place->id}/reviews", [
                'rating'  => 3,
                'comment' => 'Average visit',
            ])->assertStatus(201);

        $resUpdate = $this->actingAs($this->tourist)
            ->postJson("/api/places/{$this->place->id}/reviews", [
                'rating'  => 5,
                'comment' => 'Changed my mind, loved it!',
            ]);

        $resUpdate->assertStatus(200)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('average_rating', 5);

        $this->assertEquals(1, Review::where('user_id', $this->tourist->id)->count());
    }

    public function test_admin_can_list_moderate_and_delete_reviews(): void
    {
        $review = Review::factory()->create([
            'attraction_id' => $this->place->id,
            'user_id'       => $this->tourist->id,
            'rating'        => 2,
            'comment'       => 'Needs maintenance',
            'status'        => 'approved',
        ]);

        // Non-admin cannot access admin reviews
        $this->actingAs($this->tourist)
            ->getJson('/api/admin/reviews')
            ->assertStatus(403);

        // Admin can list reviews
        $this->actingAs($this->admin)
            ->getJson('/api/admin/reviews')
            ->assertStatus(200)
            ->assertJsonFragment(['comment' => 'Needs maintenance']);

        // Admin can update status
        $this->actingAs($this->admin)
            ->putJson("/api/admin/reviews/{$review->id}/status", [
                'status' => 'rejected',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected');

        // Admin can delete review (REQ-072)
        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/reviews/{$review->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }
}

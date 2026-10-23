<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use App\Models\VisitPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tourist;

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
    }

    public function test_tourist_cannot_access_admin_stats(): void
    {
        $this->actingAs($this->tourist)
            ->getJson('/api/admin/stats')
            ->assertStatus(403);
    }

    public function test_admin_receives_accurate_system_statistics(): void
    {
        $cat = Category::factory()->create(['status' => 'active']);
        $place = Attraction::factory()->create(['status' => 'active', 'distance_km' => 2.5]);
        $place->categories()->attach($cat);

        Review::factory()->create([
            'attraction_id' => $place->id,
            'user_id'       => $this->tourist->id,
            'rating'        => 5,
            'status'        => 'approved',
        ]);

        VisitPlan::factory()->create([
            'user_id' => $this->tourist->id,
        ]);

        $res = $this->actingAs($this->admin)
            ->getJson('/api/admin/stats');

        $res->assertStatus(200)
            ->assertJsonPath('data.places.total', 1)
            ->assertJsonPath('data.places.active', 1)
            ->assertJsonPath('data.categories.total', 1)
            ->assertJsonPath('data.users.total', 2)
            ->assertJsonPath('data.reviews.total', 1)
            ->assertJsonPath('data.reviews.approved', 1)
            ->assertJsonPath('data.plans.total', 1);
    }
}

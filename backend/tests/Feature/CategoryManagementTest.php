<?php

namespace Tests\Feature;

use App\Models\Attraction;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
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

    public function test_public_list_only_shows_active_categories(): void
    {
        Category::factory()->create(['name' => 'Active Coastal', 'status' => 'active']);
        Category::factory()->inactive()->create(['name' => 'Inactive Heritage']);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Active Coastal']);
        $response->assertJsonMissing(['name' => 'Inactive Heritage']);
    }

    public function test_public_can_view_single_category_by_id(): void
    {
        $cat = Category::factory()->create([
            'name'        => 'Cultural Temples',
            'status'      => 'active',
            'description' => 'Historic sacred spots',
        ]);

        $response = $this->getJson("/api/categories/{$cat->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Cultural Temples');
        $response->assertJsonPath('data.description', 'Historic sacred spots');
    }

    public function test_guest_cannot_create_update_or_delete_categories(): void
    {
        $cat = Category::factory()->create();

        $this->postJson('/api/categories', ['name' => 'New Spot'])->assertStatus(401);
        $this->putJson("/api/categories/{$cat->id}", ['name' => 'Updated'])->assertStatus(401);
        $this->deleteJson("/api/categories/{$cat->id}")->assertStatus(401);
        $this->getJson('/api/admin/categories')->assertStatus(401);
    }

    public function test_tourist_cannot_create_update_or_delete_categories(): void
    {
        $cat = Category::factory()->create();

        $this->actingAs($this->tourist)->postJson('/api/categories', ['name' => 'Tourist Cat'])->assertStatus(403);
        $this->actingAs($this->tourist)->putJson("/api/categories/{$cat->id}", ['name' => 'Updated'])->assertStatus(403);
        $this->actingAs($this->tourist)->deleteJson("/api/categories/{$cat->id}")->assertStatus(403);
        $this->actingAs($this->tourist)->getJson('/api/admin/categories')->assertStatus(403);
    }

    public function test_admin_can_create_category(): void
    {
        $payload = [
            'name'        => 'Wildlife Safari',
            'description' => 'Places to see wildlife and nature',
            'status'      => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/categories', $payload);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Wildlife Safari');
        $this->assertDatabaseHas('categories', ['name' => 'Wildlife Safari']);
    }

    public function test_duplicate_name_is_rejected(): void
    {
        Category::factory()->create(['name' => 'Botanical Gardens']);

        $response = $this->actingAs($this->admin)->postJson('/api/categories', [
            'name'        => 'Botanical Gardens',
            'description' => 'Duplicate attempt',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_update_category(): void
    {
        $cat = Category::factory()->create(['name' => 'Ancient Sites', 'status' => 'active']);

        $response = $this->actingAs($this->admin)->putJson("/api/categories/{$cat->id}", [
            'name'        => 'Ancient Sites', // Same name (ignored on update)
            'description' => 'Updated description text',
            'status'      => 'inactive',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.description', 'Updated description text');
        $response->assertJsonPath('data.status', 'inactive');
        $this->assertDatabaseHas('categories', [
            'id'     => $cat->id,
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_delete_category(): void
    {
        $cat = Category::factory()->create(['name' => 'Temporary Category']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/categories/{$cat->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_deleting_category_used_by_active_place_returns_409(): void
    {
        $cat = Category::factory()->create(['name' => 'Temple Category']);
        $attraction = Attraction::factory()->create([
            'name'   => 'Rankoth Viharaya',
            'status' => 'active',
        ]);

        $cat->attractions()->attach($attraction->id);

        $response = $this->actingAs($this->admin)->deleteJson("/api/categories/{$cat->id}");

        $response->assertStatus(409);
        $response->assertJsonStructure(['message']);
        $this->assertDatabaseHas('categories', ['id' => $cat->id]);
    }
}

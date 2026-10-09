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

    public function test_public_can_get_only_active_categories(): void
    {
        Category::create(['name' => 'Active Beach', 'status' => 'active']);
        Category::create(['name' => 'Inactive Spot', 'status' => 'inactive']);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Active Beach']);
        $response->assertJsonMissing(['name' => 'Inactive Spot']);
    }

    public function test_public_can_view_single_category_by_id(): void
    {
        $cat = Category::create(['name' => 'Heritage', 'status' => 'active', 'description' => 'Historic places']);

        $response = $this->getJson("/api/categories/{$cat->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', 'Heritage');
        $response->assertJsonPath('data.description', 'Historic places');
    }

    public function test_public_show_returns_404_for_missing_category(): void
    {
        $response = $this->getJson('/api/categories/99999');

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Category not found.']);
    }

    public function test_admin_categories_list_requires_authentication(): void
    {
        $response = $this->getJson('/api/admin/categories');

        $response->assertStatus(401);
    }

    public function test_non_admin_cannot_access_admin_categories_list(): void
    {
        $response = $this->actingAs($this->tourist)->getJson('/api/admin/categories');

        $response->assertStatus(403);
    }

    public function test_admin_can_get_all_categories_with_attractions_count(): void
    {
        $cat1 = Category::create(['name' => 'Beach', 'status' => 'active']);
        $cat2 = Category::create(['name' => 'Closed Museum', 'status' => 'inactive']);

        $attraction = Attraction::create([
            'name'        => 'Panadura Beach',
            'description' => 'A nice beach',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'distance_km' => 1.2,
        ]);

        $cat1->attractions()->attach($attraction->id);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/categories');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'name'              => 'Beach',
            'attractions_count' => 1,
        ]);
        $response->assertJsonFragment([
            'name'              => 'Closed Museum',
            'status'            => 'inactive',
            'attractions_count' => 0,
        ]);
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

    public function test_store_category_validation(): void
    {
        // 1. Missing name
        $response = $this->actingAs($this->admin)->postJson('/api/categories', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);

        // 2. Name too long (>60 chars)
        $response = $this->actingAs($this->admin)->postJson('/api/categories', [
            'name' => str_repeat('a', 61),
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);

        // 3. Duplicate name
        Category::create(['name' => 'Existing Category']);
        $response = $this->actingAs($this->admin)->postJson('/api/categories', [
            'name' => 'Existing Category',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);

        // 4. Invalid status
        $response = $this->actingAs($this->admin)->postJson('/api/categories', [
            'name'   => 'Valid Name',
            'status' => 'unknown_status',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }

    public function test_admin_can_update_category(): void
    {
        $cat = Category::create(['name' => 'Ancient Sites', 'status' => 'active']);

        $response = $this->actingAs($this->admin)->putJson("/api/categories/{$cat->id}", [
            'name'        => 'Ancient Sites', // Same name (ignore unique rule)
            'description' => 'Updated description',
            'status'      => 'inactive',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.description', 'Updated description');
        $response->assertJsonPath('data.status', 'inactive');
        $this->assertDatabaseHas('categories', [
            'id'     => $cat->id,
            'status' => 'inactive',
        ]);
    }

    public function test_update_category_returns_404_for_missing_category(): void
    {
        $response = $this->actingAs($this->admin)->putJson('/api/categories/99999', [
            'name' => 'New Name',
        ]);

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Category not found.']);
    }

    public function test_update_category_fails_when_name_already_taken_by_another_category(): void
    {
        $cat1 = Category::create(['name' => 'First Category']);
        $cat2 = Category::create(['name' => 'Second Category']);

        $response = $this->actingAs($this->admin)->putJson("/api/categories/{$cat2->id}", [
            'name' => 'First Category',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_admin_cannot_delete_category_attached_to_attraction_req_107(): void
    {
        $cat = Category::create(['name' => 'Temple']);
        $attraction = Attraction::create([
            'name'        => 'Rankoth Viharaya',
            'description' => 'Historic temple',
            'latitude'    => 6.71,
            'longitude'   => 79.90,
            'distance_km' => 1.8,
        ]);

        $cat->attractions()->attach($attraction->id);

        $response = $this->actingAs($this->admin)->deleteJson("/api/categories/{$cat->id}");

        $response->assertStatus(409);
        $response->assertJsonStructure(['message']);
        $this->assertDatabaseHas('categories', ['id' => $cat->id]);
    }

    public function test_admin_can_delete_unattached_category(): void
    {
        $cat = Category::create(['name' => 'Unattached Category']);

        $response = $this->actingAs($this->admin)->deleteJson("/api/categories/{$cat->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_delete_category_returns_404_if_not_found(): void
    {
        $response = $this->actingAs($this->admin)->deleteJson('/api/categories/99999');

        $response->assertStatus(404);
    }
}

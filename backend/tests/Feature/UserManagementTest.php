<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $tourist;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name'   => 'Admin User',
            'email'  => 'admin@westerntrails.lk',
            'role'   => 'admin',
            'status' => 'active',
        ]);

        $this->tourist = User::factory()->create([
            'name'   => 'Test Explorer',
            'email'  => 'explorer@example.com',
            'role'   => 'tourist',
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_or_tourist_cannot_access_user_management(): void
    {
        // Unauthenticated
        $this->getJson('/api/admin/users')->assertStatus(401);

        // Tourist
        $this->actingAs($this->tourist)
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }

    public function test_admin_can_list_users(): void
    {
        $res = $this->actingAs($this->admin)
            ->getJson('/api/admin/users');

        $res->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonFragment(['email' => 'explorer@example.com']);
    }

    public function test_admin_can_search_and_filter_users(): void
    {
        $res = $this->actingAs($this->admin)
            ->getJson('/api/admin/users?q=explorer');

        $res->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.name', 'Test Explorer');
    }

    public function test_admin_can_deactivate_and_activate_user(): void
    {
        // Deactivate tourist
        $res = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->tourist->id}", [
                'status' => 'inactive',
            ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('users', [
            'id'     => $this->tourist->id,
            'status' => 'inactive',
        ]);

        // Inactive user cannot log in
        $loginRes = $this->postJson('/api/login', [
            'email'    => 'explorer@example.com',
            'password' => 'password',
        ]);
        $loginRes->assertStatus(403);

        // Reactivate tourist
        $resActive = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->tourist->id}", [
                'status' => 'active',
            ]);

        $resActive->assertStatus(200)
            ->assertJsonPath('data.status', 'active');
    }

    public function test_admin_cannot_deactivate_or_delete_own_account(): void
    {
        // Attempt self-deactivation
        $resDeactivate = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->admin->id}", [
                'status' => 'inactive',
            ]);

        $resDeactivate->assertStatus(422)
            ->assertJsonFragment(['message' => 'You cannot deactivate your own administrative account.']);

        // Attempt self-deletion
        $resDelete = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->admin->id}");

        $resDelete->assertStatus(422)
            ->assertJsonFragment(['message' => 'You cannot delete your own administrative account.']);
    }

    public function test_admin_can_delete_user_account(): void
    {
        $res = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->tourist->id}");

        $res->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $this->tourist->id]);
    }
}

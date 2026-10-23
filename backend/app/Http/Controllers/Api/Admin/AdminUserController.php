<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    /**
     * View registered users (REQ-099).
     * GET /api/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->withCount(['plans', 'favorites', 'reviews'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q);
            $pattern = "%{$escaped}%";
            $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';

            $query->where(function ($b) use ($operator, $pattern) {
                $b->where('name', $operator, $pattern)
                  ->orWhere('email', $operator, $pattern);
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->paginate(20);

        $data = $users->map(fn (User $u) => [
            'id'              => $u->id,
            'name'            => $u->name,
            'email'           => $u->email,
            'role'            => $u->role,
            'status'          => $u->status,
            'plans_count'     => $u->plans_count,
            'favorites_count' => $u->favorites_count,
            'reviews_count'   => $u->reviews_count,
            'created_at'      => $u->created_at?->toISOString(),
            'formatted_date'  => $u->created_at?->format('M d, Y'),
        ]);

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * Approve or update user account status/role (REQ-100, REQ-101, REQ-102).
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, string|int $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (! $targetUser) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Prevent self-deactivation or self-demotion (REQ-102)
        if ($request->user()->id === $targetUser->id) {
            if ($request->has('status') && $request->input('status') !== 'active') {
                return response()->json([
                    'message' => 'You cannot deactivate your own administrative account.',
                ], 422);
            }
            if ($request->has('role') && $request->input('role') !== 'admin') {
                return response()->json([
                    'message' => 'You cannot remove your own administrative privileges.',
                ], 422);
            }
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'in:active,inactive'],
            'role'   => ['sometimes', 'required', 'in:tourist,admin'],
        ]);

        $targetUser->update($validated);

        return response()->json([
            'message' => "User {$targetUser->name} updated successfully.",
            'data'    => [
                'id'         => $targetUser->id,
                'name'       => $targetUser->name,
                'email'      => $targetUser->email,
                'role'       => $targetUser->role,
                'status'     => $targetUser->status,
                'created_at' => $targetUser->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Remove user account (REQ-101).
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, string|int $id): JsonResponse
    {
        $targetUser = User::find($id);

        if (! $targetUser) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Prevent self-deletion
        if ($request->user()->id === $targetUser->id) {
            return response()->json([
                'message' => 'You cannot delete your own administrative account.',
            ], 422);
        }

        $targetUser->delete();

        return response()->json([
            'message' => 'User account deleted successfully.',
        ]);
    }
}

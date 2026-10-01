<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Role is set by the server only, never by the client (BR-002)
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],   // hashed by the model cast
            'role'     => 'tourist',
            'status'   => 'active',
        ]);

        return response()->json([
            'message' => 'Registration successful.',
            'user'    => $this->userData($user),
            'token'   => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        // One generic message so attackers can't tell which emails exist (REQ-008)
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'This account has been deactivated.'], 403);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $this->userData($user),
            'token'   => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();   // REQ-007

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userData($request->user())]);
    }

    // Never return the password hash or other internal columns
    private function userData(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}

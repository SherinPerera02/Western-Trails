<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Public listing: only active categories.
     * GET /api/categories
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::where('status', 'active')->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Public show: view single category by id.
     * GET /api/categories/{id}
     */
    public function show(string|int $id): JsonResponse|CategoryResource
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        return new CategoryResource($category);
    }

    /**
     * Admin listing: all categories across all statuses, with attractions_count.
     * GET /api/admin/categories
     */
    public function adminIndex(): AnonymousResourceCollection
    {
        $categories = Category::withCount('attractions')->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Admin create: store a new category.
     * POST /api/categories
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Admin update: update an existing category.
     * PUT /api/categories/{id}
     */
    public function update(UpdateCategoryRequest $request, string|int $id): JsonResponse|CategoryResource
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        $category->update($request->validated());

        return new CategoryResource($category);
    }

    /**
     * Admin delete: delete category if not attached to any non-deleted attraction (REQ-107).
     * DELETE /api/categories/{id}
     */
    public function destroy(string|int $id): JsonResponse
    {
        $category = Category::find($id);

        if (! $category) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);
        }

        // REQ-107: Refuse deletion if attached to any non-deleted attraction
        if ($category->attractions()->exists()) {
            $count = $category->attractions()->count();
            return response()->json([
                'message' => "Cannot delete category: it is still attached to {$count} attraction(s).",
                'attractions_count' => $count,
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ], 200);
    }
}

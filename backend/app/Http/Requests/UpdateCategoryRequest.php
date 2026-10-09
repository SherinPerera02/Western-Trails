<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('category');
        if ($id instanceof \App\Models\Category) {
            $id = $id->id;
        }

        return [
            'name'        => [
                'required',
                'string',
                'max:60',
                Rule::unique('categories', 'name')->ignore($id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'status'      => ['sometimes', 'in:active,inactive'],
        ];
    }
}

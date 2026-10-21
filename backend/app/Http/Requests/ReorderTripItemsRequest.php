<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderTripItemsRequest extends FormRequest
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
        return [
            'item_ids'   => ['required', 'array'],
            'item_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'item_ids.required'        => 'Item IDs array is required.',
            'item_ids.array'           => 'Item IDs must be an array.',
            'item_ids.*.required'      => 'Each item ID is required.',
            'item_ids.*.integer'       => 'Each item ID must be an integer.',
            'item_ids.*.distinct'      => 'Item IDs cannot contain duplicates.',
        ];
    }
}

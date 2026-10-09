<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlaceRequest extends FormRequest
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
            'name'               => ['sometimes', 'required', 'string', 'max:150'],
            'description'        => ['sometimes', 'required', 'string', 'max:5000'],
            'category_ids'       => ['sometimes', 'required', 'array', 'min:1'],
            'category_ids.*'     => [
                'integer',
                Rule::exists('categories', 'id')->where('status', 'active'),
            ],
            'latitude'           => ['sometimes', 'required', 'numeric', 'between:5.9,9.9'],
            'longitude'          => ['sometimes', 'required', 'numeric', 'between:79.5,82.0'],
            'address'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'opening_hours'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_info'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'entrance_fee'       => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'facilities'         => ['sometimes', 'nullable', 'string', 'max:2000'],
            'activities'         => ['sometimes', 'nullable', 'string', 'max:2000'],
            'travel_tips'        => ['sometimes', 'nullable', 'string', 'max:2000'],
            'visitor_guidelines' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'status'             => ['sometimes', 'in:active,inactive'],
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
            'name.required'          => 'The place name cannot be empty.',
            'name.max'               => 'The place name must not exceed 150 characters.',
            'description.required'   => 'The description cannot be empty.',
            'description.max'        => 'The description must not exceed 5000 characters.',
            'category_ids.required'  => 'At least one category must be selected when updating categories.',
            'category_ids.array'     => 'The category IDs must be provided as an array.',
            'category_ids.min'       => 'At least one category must be selected when updating categories.',
            'category_ids.*.integer' => 'Each category ID must be a valid integer.',
            'category_ids.*.exists'  => 'Selected category is invalid or inactive.',
            'latitude.required'      => 'The latitude coordinate cannot be empty.',
            'latitude.numeric'       => 'The latitude must be a valid numeric value.',
            'latitude.between'       => 'Latitude must be within Sri Lanka boundaries (between 5.9 and 9.9).',
            'longitude.required'     => 'The longitude coordinate cannot be empty.',
            'longitude.numeric'      => 'The longitude must be a valid numeric value.',
            'longitude.between'      => 'Longitude must be within Sri Lanka boundaries (between 79.5 and 82.0).',
            'address.max'            => 'The address must not exceed 255 characters.',
            'opening_hours.max'      => 'The opening hours must not exceed 255 characters.',
            'contact_info.max'       => 'The contact info must not exceed 255 characters.',
            'entrance_fee.numeric'   => 'The entrance fee must be a valid number.',
            'entrance_fee.min'       => 'The entrance fee cannot be negative.',
            'facilities.max'         => 'Facilities information must not exceed 2000 characters.',
            'activities.max'         => 'Activities information must not exceed 2000 characters.',
            'travel_tips.max'        => 'Travel tips must not exceed 2000 characters.',
            'visitor_guidelines.max' => 'Visitor guidelines must not exceed 2000 characters.',
            'status.in'              => 'The status must be either active or inactive.',
        ];
    }
}

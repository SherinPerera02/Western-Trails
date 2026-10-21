<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTripRequest extends FormRequest
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
            'plan_name'          => ['required', 'string', 'max:100'],
            'visit_date'         => ['nullable', 'date', 'after_or_equal:today'],
            'attraction_ids'     => ['nullable', 'array', 'max:12'],
            'attraction_ids.*'   => [
                'integer',
                'distinct',
                Rule::exists('attractions', 'id')
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
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
            'plan_name.required'        => 'Plan name is required.',
            'plan_name.max'             => 'Plan name cannot exceed 100 characters.',
            'visit_date.after_or_equal' => 'Visit date must not be in the past.',
            'attraction_ids.max'        => 'A visit plan cannot exceed 12 items.',
            'attraction_ids.*.distinct' => 'Duplicate attractions are not allowed in the same plan.',
            'attraction_ids.*.exists'   => 'Selected attraction is invalid, inactive, or has been removed.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTripRequest extends FormRequest
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
            'plan_name'             => ['sometimes', 'required', 'string', 'max:100'],
            'visit_date'            => ['nullable', 'date', 'after_or_equal:today'],
            'items'                 => ['nullable', 'array', 'max:12'],
            'items.*.attraction_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('attractions', 'id')
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'items.*.start_time'    => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'items.*.notes'         => ['nullable', 'string', 'max:255'],
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
            'plan_name.required'                 => 'Plan name cannot be empty.',
            'plan_name.max'                      => 'Plan name cannot exceed 100 characters.',
            'visit_date.after_or_equal'          => 'Visit date must not be in the past.',
            'items.max'                          => 'A visit plan cannot exceed 12 items.',
            'items.*.attraction_id.required'     => 'Attraction ID is required for each item.',
            'items.*.attraction_id.distinct'     => 'Duplicate attractions are not allowed in the same plan.',
            'items.*.attraction_id.exists'       => 'Selected attraction is invalid, inactive, or has been removed.',
            'items.*.start_time.regex'           => 'Start time must be in HH:MM or HH:MM:SS format.',
            'items.*.notes.max'                  => 'Notes cannot exceed 255 characters.',
        ];
    }
}

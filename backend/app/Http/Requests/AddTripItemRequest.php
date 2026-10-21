<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddTripItemRequest extends FormRequest
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
            'attraction_id' => [
                'required',
                'integer',
                Rule::exists('attractions', 'id')
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'start_time'    => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'notes'         => ['nullable', 'string', 'max:255'],
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
            'attraction_id.required' => 'Attraction ID is required.',
            'attraction_id.exists'   => 'Selected attraction is invalid, inactive, or has been removed.',
            'start_time.regex'       => 'Start time must be in HH:MM or HH:MM:SS format.',
            'notes.max'              => 'Notes cannot exceed 255 characters.',
        ];
    }
}

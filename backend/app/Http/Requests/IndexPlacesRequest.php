<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexPlacesRequest extends FormRequest
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
            'q'            => ['sometimes', 'nullable', 'string', 'max:255'],
            'category'     => [
                'sometimes',
                'nullable',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if (is_array($value)) {
                        if (empty($value)) {
                            return;
                        }
                        foreach ($value as $item) {
                            if (! is_numeric($item) || (int) $item != $item || (int) $item <= 0) {
                                $fail('Category IDs must be positive integers.');
                                return;
                            }
                        }
                        return;
                    }

                    if (! is_string($value) && ! is_numeric($value)) {
                        $fail('Category must be an integer or comma-separated list of integers.');
                        return;
                    }

                    $parts = explode(',', (string) $value);
                    foreach ($parts as $part) {
                        $trimmed = trim($part);
                        if ($trimmed === '' || ! ctype_digit($trimmed) || (int) $trimmed <= 0) {
                            $fail('Category IDs must be positive integers.');
                            return;
                        }
                    }
                },
            ],
            'max_distance' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'max_fee'      => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'free'         => ['sometimes', 'nullable', 'in:0,1,true,false'],
            'sort'         => ['sometimes', 'nullable', 'string', 'max:50'],
            'page'         => ['sometimes', 'nullable', 'integer', 'min:1'],
            'per_page'     => ['sometimes', 'nullable', 'integer', 'min:1', 'max:50'],
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
            'max_distance.numeric' => 'The max distance must be a number.',
            'max_distance.min'     => 'The max distance must be at least 0.',
            'max_fee.numeric'      => 'The max fee must be a number.',
            'max_fee.min'          => 'The max fee must be at least 0.',
            'free.in'              => 'The free parameter must be 0 or 1.',
            'per_page.integer'     => 'The per page parameter must be an integer.',
            'per_page.min'         => 'The per page parameter must be at least 1.',
            'per_page.max'         => 'The per page parameter may not be greater than 50.',
            'page.integer'         => 'The page parameter must be an integer.',
            'page.min'             => 'The page parameter must be at least 1.',
        ];
    }
}

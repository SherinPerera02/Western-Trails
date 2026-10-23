<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required' => 'Please provide a star rating between 1 and 5.',
            'rating.min'      => 'Rating must be at least 1 star.',
            'rating.max'      => 'Rating cannot exceed 5 stars.',
            'comment.max'     => 'Your review comment cannot exceed 1,000 characters.',
        ];
    }
}

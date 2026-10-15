<?php

namespace App\Http\Requests;

use App\Models\Attraction;
use Illuminate\Foundation\Http\FormRequest;

class UploadPlaceImagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Support single file under 'images' or array 'images[]'
        if ($this->hasFile('images') && ! is_array($this->file('images'))) {
            $this->merge([
                'images' => [$this->file('images')],
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images'     => ['required', 'array', 'min:1', 'max:8'],
            'images.*'   => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:2048',
            ],
            'captions'   => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $placeId = $this->route('id');
            $place = Attraction::find($placeId);

            $uploadedFiles = $this->file('images', []);
            if (! is_array($uploadedFiles)) {
                $uploadedFiles = [$uploadedFiles];
            }

            if ($place) {
                $existingCount = $place->images()->count();
                $uploadCount = count($uploadedFiles);

                if (($existingCount + $uploadCount) > 8) {
                    $remaining = max(0, 8 - $existingCount);
                    $validator->errors()->add(
                        'images',
                        "A place cannot have more than 8 images. This place already has {$existingCount} image(s), so you can upload at most {$remaining} more."
                    );
                }
            }

            // Verify the real underlying MIME type directly via finfo
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            $finfo = new \finfo(FILEINFO_MIME_TYPE);

            foreach ($uploadedFiles as $index => $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                    $realPath = $file->getRealPath();
                    if ($realPath && file_exists($realPath)) {
                        $detectedMime = $finfo->file($realPath);
                        if ($detectedMime && ! in_array($detectedMime, $allowedMimes, true)) {
                            $validator->errors()->add(
                                "images.{$index}",
                                "The uploaded file is not a valid image format (detected: {$detectedMime})."
                            );
                        }
                    }
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.required'    => 'Please select at least one image to upload.',
            'images.array'       => 'The images must be provided as a list of files.',
            'images.min'         => 'Please select at least one image to upload.',
            'images.max'         => 'You cannot upload more than 8 images in a single request.',
            'images.*.required'  => 'Each image file is required.',
            'images.*.file'      => 'Each uploaded item must be a valid file.',
            'images.*.image'     => 'The uploaded file must be a real image.',
            'images.*.mimes'     => 'Each image must be of type: jpg, jpeg, png, or webp.',
            'images.*.mimetypes' => 'Each image must have a valid MIME type (image/jpeg, image/png, image/webp).',
            'images.*.max'       => 'Each image file must not exceed 2 MB.',
            'captions.array'     => 'Captions must be provided as an array.',
            'captions.*.max'     => 'Each caption must not exceed 255 characters.',
        ];
    }
}

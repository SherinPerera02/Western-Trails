<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attraction extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function categories(): BelongsToMany { return $this->belongsToMany(Category::class, 'attraction_category'); }
    public function images(): HasMany         { return $this->hasMany(AttractionImage::class); }
    public function firstImage(): \Illuminate\Database\Eloquent\Relations\HasOne { return $this->hasOne(AttractionImage::class)->oldestOfMany(); }
    public function reviews(): HasMany        { return $this->hasMany(Review::class); }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude'     => 'float',
            'longitude'    => 'float',
            'distance_km'  => 'float',
            'entrance_fee' => 'float',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::forceDeleting(function (Attraction $attraction) {
            \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory("places/{$attraction->id}");
        });
    }
}

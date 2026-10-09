<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Attraction extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function categories() { return $this->belongsToMany(Category::class, 'attraction_category'); }
    public function images()     { return $this->hasMany(AttractionImage::class); }
    public function reviews()    { return $this->hasMany(Review::class); }

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
}

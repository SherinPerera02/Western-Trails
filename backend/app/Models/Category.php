<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $guarded = [];

    public function attractions() { return $this->belongsToMany(Attraction::class, 'attraction_category'); }
}

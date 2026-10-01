<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttractionImage extends Model
{
    protected $guarded = [];

    public function attraction() { return $this->belongsTo(Attraction::class); }
}

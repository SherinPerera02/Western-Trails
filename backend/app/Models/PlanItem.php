<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanItem extends Model
{
    protected $guarded = [];

    public function attraction() { return $this->belongsTo(Attraction::class); }
    public function visitPlan()  { return $this->belongsTo(VisitPlan::class); }
}

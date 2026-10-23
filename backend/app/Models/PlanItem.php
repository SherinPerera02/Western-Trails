<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_plan_id',
        'attraction_id',
        'sequence',
        'start_time',
        'notes',
    ];

    public function attraction() { return $this->belongsTo(Attraction::class)->withTrashed(); }
    public function visitPlan()  { return $this->belongsTo(VisitPlan::class); }

    protected function casts(): array
    {
        return [
            'sequence'      => 'integer',
            'attraction_id' => 'integer',
            'visit_plan_id' => 'integer',
        ];
    }
}

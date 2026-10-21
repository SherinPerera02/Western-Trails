<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitPlan extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function user()  { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(PlanItem::class)->orderBy('sequence'); }

    protected function casts(): array
    {
        return [
            'visit_date' => 'date:Y-m-d',
            'user_id'    => 'integer',
        ];
    }
}

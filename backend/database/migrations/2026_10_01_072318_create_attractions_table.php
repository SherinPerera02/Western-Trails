<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attractions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('distance_km', 5, 2)->nullable();
            $table->string('opening_hours')->nullable();
            $table->decimal('entrance_fee', 10, 2)->nullable();
            $table->text('facilities')->nullable();
            $table->text('activities')->nullable();
            $table->text('travel_tips')->nullable();
            $table->text('visitor_guidelines')->nullable();
            $table->string('contact_info')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();     // supports BR-005
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attractions');
    }
};

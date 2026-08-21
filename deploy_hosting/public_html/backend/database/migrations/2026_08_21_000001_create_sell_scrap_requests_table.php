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
        Schema::create('sell_scrap_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('seller_name');
            $table->string('seller_phone');
            $table->string('seller_email');
            $table->string('gst_number')->nullable();
            $table->string('title');
            $table->string('category_id')->nullable();
            $table->string('category_name')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('MT');
            $table->string('location_state')->default('Maharashtra');
            $table->string('location_city')->default('Mumbai');
            $table->text('site_address')->nullable();
            $table->text('description')->nullable();
            $table->text('image_url')->nullable();
            $table->string('status')->default('pending'); // pending, contacted, converted, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sell_scrap_requests');
    }
};

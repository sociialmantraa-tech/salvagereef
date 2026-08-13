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
        // 1. Error Logs Table
        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->string('severity')->default('error'); // error, critical, warning, info
            $table->text('message');
            $table->string('exception_class')->nullable();
            $table->string('file')->nullable();
            $table->integer('line')->nullable();
            $table->text('url')->nullable();
            $table->string('method', 10)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->longText('stack_trace')->nullable();
            $table->enum('status', ['unresolved', 'resolved'])->default('unresolved');
            $table->timestamps();

            $table->index(['severity', 'status']);
            $table->index('created_at');
        });

        // 2. System Settings Table (for Maintenance Mode and general system configs)
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('error_logs');
    }
};

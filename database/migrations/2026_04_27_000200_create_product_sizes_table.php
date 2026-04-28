<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_sizes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('size', 10);
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();

            // Ensure unique size per product
            $table->unique(['product_id', 'size']);

            // Index for faster lookups
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sizes');
    }
};

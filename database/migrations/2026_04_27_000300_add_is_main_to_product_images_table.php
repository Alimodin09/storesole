<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table): void {
            // Add is_main column if it doesn't exist
            if (!Schema::hasColumn('product_images', 'is_main')) {
                $table->boolean('is_main')->default(false)->after('image_path');
            }

            // Add index for querying main images
            if (!Schema::hasIndex('product_images', 'product_images_is_main_index')) {
                $table->index('is_main');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table): void {
            if (Schema::hasColumn('product_images', 'is_main')) {
                $table->dropColumn('is_main');
            }
        });
    }
};

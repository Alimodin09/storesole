<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            // Rename category to product_type
            if (Schema::hasColumn('products', 'category')) {
                $table->renameColumn('category', 'product_type');
            }

            // Rename audience to target_group
            if (Schema::hasColumn('products', 'audience')) {
                $table->renameColumn('audience', 'target_group');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            // Revert renames
            if (Schema::hasColumn('products', 'product_type')) {
                $table->renameColumn('product_type', 'category');
            }

            if (Schema::hasColumn('products', 'target_group')) {
                $table->renameColumn('target_group', 'audience');
            }
        });
    }
};

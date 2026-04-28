<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            // Add index on target_group if it doesn't exist
            if (!Schema::hasIndex('products', 'products_target_group_index')) {
                $table->index('target_group');
            }

            // Add index on product_type if it doesn't exist
            if (!Schema::hasIndex('products', 'products_product_type_index')) {
                $table->index('product_type');
            }
        });

        Schema::table('orders', function (Blueprint $table): void {
            // Add index on status if it doesn't exist
            if (!Schema::hasIndex('orders', 'orders_status_index')) {
                $table->index('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasIndex('products', 'products_target_group_index')) {
                $table->dropIndex('products_target_group_index');
            }

            if (Schema::hasIndex('products', 'products_product_type_index')) {
                $table->dropIndex('products_product_type_index');
            }
        });

        Schema::table('orders', function (Blueprint $table): void {
            if (Schema::hasIndex('orders', 'orders_status_index')) {
                $table->dropIndex('orders_status_index');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            // Defaulting legacy rows to "kids" keeps storefront filtering stable after rollout.
            $table->string('audience', 20)->default('kids')->after('category');
        });

        DB::table('products')
            ->whereNull('audience')
            ->update(['audience' => 'kids']);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('audience');
        });
    }
};

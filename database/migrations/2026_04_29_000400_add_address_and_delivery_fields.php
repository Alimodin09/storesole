<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('address')->nullable()->after('phone');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('contact_phone')->nullable()->after('payment_method');
            $table->text('delivery_address')->nullable()->after('contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('address');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['contact_phone', 'delivery_address']);
        });
    }
};

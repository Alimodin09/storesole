<?php

namespace App\Http\Controllers;

use App\Models\Order;

class ReportController extends Controller
{
    public function sales()
    {
        $orders = Order::with('user:id,name')
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename=sales-report.csv',
        ];

        $callback = static function () use ($orders): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Order ID', 'Customer Name', 'Total', 'Status', 'Date']);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->id,
                    $order->user?->name ?? 'Guest',
                    number_format((float) $order->total, 2, '.', ''),
                    $order->status,
                    optional($order->created_at)->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}

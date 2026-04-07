<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    private const ALLOWED_STATUSES = [
        'Pending',
        'Processing',
        'Ready for Pickup',
        'Delivered',
        'Completed',
    ];

    public function index()
    {
        $orders = Order::with([
            'user:id,name,email',
            'orderItems.product:id,name,image,category,size',
        ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        return response()->json($order->load([
            'user:id,name,email',
            'orderItems.product:id,name,image,category,size',
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.size' => ['nullable', 'string', 'max:50'],
            'payment_method' => ['required', 'in:cod,cop'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $order = DB::transaction(function () use ($validated, $user) {
            $total = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['id']);
                $quantity = (int) $item['quantity'];

                if ($product->stock < $quantity) {
                    throw new HttpResponseException(response()->json([
                        'message' => sprintf('Not enough stock for %s.', $product->name),
                    ], 422));
                }

                $product->stock -= $quantity;
                $product->save();

                $unitPrice = (float) $product->price;
                $total += $unitPrice * $quantity;
                $lineItems[] = [
                    'product_id' => $product->id,
                    'size' => $item['size'] ?? $product->size,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'Pending',
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($lineItems as $lineItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $lineItem['product_id'],
                    'size' => $lineItem['size'],
                    'quantity' => $lineItem['quantity'],
                    'unit_price' => $lineItem['unit_price'],
                ]);
            }

            return $order->load([
                'user:id,name',
                'orderItems.product:id,name,image',
            ]);
        });

        return response()->json([
            'message' => 'Order placed successfully.',
            'order' => $order,
        ], 201);
    }

    public function myOrders(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        return response()->json($user->orders()
            ->with('orderItems')
            ->latest()
            ->get());
    }

    public function showMyOrder(Request $request, int $order)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $record = Order::with([
            'orderItems.product:id,name,image,size',
            'user:id,name,email',
        ])
            ->where('user_id', $user->id)
            ->findOrFail($order);

        return response()->json($record);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(self::ALLOWED_STATUSES)],
        ]);

        $order->status = $validated['status'];
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order->load([
                'user:id,name,email',
                'orderItems.product:id,name,image,category,size',
            ]),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RiderController extends Controller
{
    /**
     * GET /api/riders
     * Return all riders where status = available.
     */
    public function index()
    {
        $riders = Rider::where('status', 'available')->get(['id', 'name', 'phone', 'status']);

        return response()->json($riders);
    }

    /**
     * POST /api/orders/{order}/assign-rider
     * Assign a rider to an order.
     */
    public function assignRider(Request $request, Order $order)
    {
        $validated = $request->validate([
            'rider_id' => ['required', 'integer', 'exists:riders,id'],
        ]);

        $order->rider_id = $validated['rider_id'];
        $order->rider_status = 'pending';
        $order->save();

        $order->load('rider:id,name,phone');

        return response()->json([
            'message' => 'Rider assigned successfully.',
            'order' => $order,
        ]);
    }

    /**
     * GET /api/rider/orders
     * Return orders assigned to the authenticated rider (pending + accepted + delivered).
     */
    public function myOrders(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $rider = Rider::where('user_id', $user->id)->first();

        if (!$rider) {
            return response()->json([], 200);
        }

        $orders = Order::with([
            'user:id,name,email,phone,address',
            'orderItems.product:id,name,image,size',
        ])
            ->where('rider_id', $rider->id)
            ->whereIn('rider_status', ['pending', 'accepted', 'delivered'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    /**
     * POST /api/rider/orders/{order}/accept
     * Rider accepts the assigned order.
     */
    public function acceptOrder(Request $request, Order $order)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $rider = Rider::where('user_id', $user->id)->first();

        if (!$rider || $order->rider_id !== $rider->id) {
            return response()->json(['message' => 'This order is not assigned to you.'], 403);
        }

        $order->rider_status = 'accepted';
        $order->save();

        $rider->status = 'busy';
        $rider->save();

        return response()->json([
            'message' => 'Order accepted.',
            'order' => $order->load(['user:id,name,email,phone', 'rider:id,name,phone']),
        ]);
    }

    /**
     * POST /api/rider/orders/{order}/reject
     * Rider rejects the assigned order.
     */
    public function rejectOrder(Request $request, Order $order)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $rider = Rider::where('user_id', $user->id)->first();

        if (!$rider || $order->rider_id !== $rider->id) {
            return response()->json(['message' => 'This order is not assigned to you.'], 403);
        }

        $order->rider_status = 'rejected';
        $order->rider_id = null;
        $order->save();

        return response()->json([
            'message' => 'Order rejected.',
            'order' => $order,
        ]);
    }

    /**
     * POST /api/rider/orders/{order}/deliver
     * Rider marks order as delivered.
     */
    public function deliverOrder(Request $request, Order $order)
    {
        /** @var \App\Models\User $user */
        $user = $request->attributes->get('auth_user');

        $rider = Rider::where('user_id', $user->id)->first();

        if (!$rider || $order->rider_id !== $rider->id) {
            return response()->json(['message' => 'This order is not assigned to you.'], 403);
        }

        if ($order->rider_status !== 'accepted') {
            return response()->json(['message' => 'Order must be accepted before marking as delivered.'], 422);
        }

        $order->rider_status = 'delivered';
        $order->status = 'Delivered';
        $order->save();

        $rider->status = 'available';
        $rider->save();

        return response()->json([
            'message' => 'Order marked as delivered.',
            'order' => $order->load(['user:id,name,email,phone', 'rider:id,name,phone']),
        ]);
    }

    /**
     * POST /api/auth/rider-login
     * Authenticate a rider user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->role !== 'rider') {
            return response()->json(['message' => 'This login is for riders only.'], 403);
        }

        $plainToken = Str::random(60);
        $user->api_token = hash('sha256', $plainToken);
        $user->save();

        return response()->json([
            'message' => 'Rider login successful.',
            'token' => $plainToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * POST /api/auth/rider-register
     * Register a new rider account.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => $validated['password'],
            'role' => 'rider',
        ]);

        Rider::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'status' => 'available',
        ]);

        return response()->json([
            'message' => 'Rider account created successfully.',
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SellScrapRequest;
use Illuminate\Http\Request;

class SellScrapRequestController extends Controller
{
    /**
     * Store a new user sell scrap request submission
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|string',
            'category_name' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'location_state' => 'required|string|max:100',
            'location_city' => 'required|string|max:100',
            'site_address' => 'nullable|string|max:1000',
            'gst_number' => 'nullable|string|max:50',
            'seller_name' => 'required|string|max:255',
            'seller_phone' => 'required|string|max:50',
            'seller_email' => 'required|email|max:255',
            'description' => 'required|string|max:5000',
            'image_url' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();

        $req = SellScrapRequest::create([
            'user_id' => $user ? $user->id : null,
            'seller_name' => $validated['seller_name'],
            'seller_phone' => $validated['seller_phone'],
            'seller_email' => $validated['seller_email'],
            'gst_number' => $validated['gst_number'] ?? null,
            'title' => $validated['title'],
            'category_id' => $validated['category_id'] ?? '1',
            'category_name' => $validated['category_name'] ?? 'General Scrap',
            'price' => $validated['price'],
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'location_state' => $validated['location_state'],
            'location_city' => $validated['location_city'],
            'site_address' => $validated['site_address'] ?? null,
            'description' => $validated['description'],
            'image_url' => $validated['image_url'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scrap details submitted directly to Admin Desk successfully.',
            'data' => $req,
        ], 201);
    }

    /**
     * Display all sell scrap requests for Admin Desk
     */
    public function index(Request $request)
    {
        $requests = SellScrapRequest::with('user:id,name,email,phone')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
            'total' => $requests->count(),
        ]);
    }

    /**
     * Update request status (pending, contacted, converted, rejected)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,converted,rejected',
        ]);

        $scrapReq = SellScrapRequest::findOrFail($id);
        $scrapReq->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully.',
            'data' => $scrapReq,
        ]);
    }

    /**
     * Delete a sell scrap request
     */
    public function destroy($id)
    {
        $scrapReq = SellScrapRequest::findOrFail($id);
        $scrapReq->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sell scrap request deleted successfully.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Classified;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClassifiedController extends Controller
{
    public function index(Request $request)
    {
        $query = Classified::with(['category', 'primaryImage', 'creator']);

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('location') && $request->location) {
            $query->where(function ($q) use ($request) {
                $q->where('location_city', 'like', '%' . $request->location . '%')
                  ->orWhere('location_state', 'like', '%' . $request->location . '%');
            });
        }

        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $classifieds = $query->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($classifieds);
    }

    public function show($slug)
    {
        $classified = Classified::with(['category', 'images', 'creator'])
            ->where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        return response()->json($classified);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $user->role !== 'agent') {
            return response()->json(['message' => 'Only administrators or authorized disposal agents can post listings.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|gt:0',
            'quantity' => 'required|numeric|gt:0',
            'unit' => 'required|string|max:50',
            'location_city' => 'required|string|max:100',
            'location_state' => 'required|string|max:100',
            'image_url' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(5);

        $classified = Classified::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'price' => $validated['price'],
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'location_city' => $validated['location_city'],
            'location_state' => $validated['location_state'],
            'status' => 'available',
            'created_by' => $user->id,
        ]);

        if (!empty($validated['image_url'])) {
            $classified->images()->create([
                'image_path' => $validated['image_url'],
                'is_primary' => true,
            ]);
        }

        return response()->json($classified, 201);
    }
}

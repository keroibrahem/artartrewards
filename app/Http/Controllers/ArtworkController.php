<?php

namespace App\Http\Controllers;

use App\Models\Artwork;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtworkController extends Controller
{
    /**
     * عرض كل الـ artworks مع search و sort و pagination - JSON
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $sort = $request->get('sort', 'newest');
        
        $artworks = Artwork::with('collections')
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                           ->orWhere('artist_name', 'like', "%{$search}%")
                           ->orWhere('category', 'like', "%{$search}%");
            })
            ->when($sort, function ($query, $sort) {
                return match($sort) {
                    'newest' => $query->orderBy('created_at', 'desc'),
                    'oldest' => $query->orderBy('created_at', 'asc'),
                    'title-asc' => $query->orderBy('title', 'asc'),
                    'title-desc' => $query->orderBy('title', 'desc'),
                    'price-asc' => $query->orderBy('price', 'asc'),
                    'price-desc' => $query->orderBy('price', 'desc'),
                    default => $query->orderBy('created_at', 'desc')
                };
            })
            ->paginate(6);

        return response()->json([
            'success' => true,
            'data' => [
                'artworks' => $artworks->items(),
                'pagination' => [
                    'current_page' => $artworks->currentPage(),
                    'last_page' => $artworks->lastPage(),
                    'total' => $artworks->total(),
                    'per_page' => $artworks->perPage()
                ]
            ]
        ]);
    }

    /**
     * حفظ artwork جديد - JSON
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'artist_name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'subjects' => 'nullable|array',
            'materials' => 'nullable|array',
            'styles' => 'nullable|array',
            'collection_ids' => 'nullable|array',
            'collection_ids.*' => 'exists:collections,id'
        ]);

        $imagePath = $request->file('image')->store('artworks', 'public');

        $artwork = Artwork::create([
            'title' => $request->title,
            'description' => $request->description,
            'image' => $imagePath,
            'artist_name' => $request->artist_name,
            'price' => $request->price,
            'category' => $request->category,
            'subjects' => $request->subjects,
            'materials' => $request->materials,
            'styles' => $request->styles,
        ]);

        // إضافة الـ artwork للـ collections المختارة
        if ($request->has('collection_ids')) {
            $artwork->collections()->attach($request->collection_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Artwork created successfully!',
            'data' => $artwork->load('collections')
        ], 201);
    }

    /**
     * عرض artwork معين - JSON
     */
    public function show(Artwork $artwork)
    {
        $artwork->load('collections');
        
        return response()->json([
            'success' => true,
            'data' => $artwork
        ]);
    }

    /**
     * تحديث artwork - JSON
     */
    public function update(Request $request, Artwork $artwork)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'artist_name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'subjects' => 'nullable|array',
            'materials' => 'nullable|array',
            'styles' => 'nullable|array',
            'collection_ids' => 'nullable|array',
            'collection_ids.*' => 'exists:collections,id'
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
            'artist_name' => $request->artist_name,
            'price' => $request->price,
            'category' => $request->category,
            'subjects' => $request->subjects,
            'materials' => $request->materials,
            'styles' => $request->styles,
        ];

        if ($request->hasFile('image')) {
            // مسح الصورة القديمة
            if ($artwork->image) {
                Storage::disk('public')->delete($artwork->image);
            }
            $data['image'] = $request->file('image')->store('artworks', 'public');
        }

        $artwork->update($data);

        // تحديث الـ collections
        if ($request->has('collection_ids')) {
            $artwork->collections()->sync($request->collection_ids);
        } else {
            $artwork->collections()->detach();
        }

        return response()->json([
            'success' => true,
            'message' => 'Artwork updated successfully!',
            'data' => $artwork->fresh('collections')
        ]);
    }

    /**
     * حذف artwork - JSON
     */
    public function destroy(Artwork $artwork)
    {
        if ($artwork->image) {
            Storage::disk('public')->delete($artwork->image);
        }
        
        $artwork->collections()->detach();
        $artwork->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artwork deleted successfully!'
        ]);
    }

    /**
     * جلب الـ artworks المتاحة للإضافة لـ collection - JSON
     */
    public function availableArtworks(Request $request)
    {
        $search = $request->get('search', '');
        $sort = $request->get('sort', 'newest');
        $collectionId = $request->get('collection_id');
        
        $artworks = Artwork::with('collections')
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                           ->orWhere('artist_name', 'like', "%{$search}%");
            })
            ->when($sort, function ($query, $sort) {
                return match($sort) {
                    'newest' => $query->orderBy('created_at', 'desc'),
                    'oldest' => $query->orderBy('created_at', 'asc'),
                    'title-asc' => $query->orderBy('title', 'asc'),
                    'title-desc' => $query->orderBy('title', 'desc'),
                    default => $query->orderBy('created_at', 'desc')
                };
            })
            ->paginate(6);

        return response()->json([
            'success' => true,
            'data' => [
                'artworks' => $artworks->items(),
                'pagination' => [
                    'current_page' => $artworks->currentPage(),
                    'last_page' => $artworks->lastPage(),
                    'total' => $artworks->total(),
                    'per_page' => $artworks->perPage()
                ],
                'collection_id' => $collectionId
            ]
        ]);
    }
}
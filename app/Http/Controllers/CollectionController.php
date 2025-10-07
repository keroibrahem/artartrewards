<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Artwork;
use App\Models\Artist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CollectionController extends Controller
{
   
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $sort = $request->get('sort', 'newest');
        
        $query = Collection::with(['artist', 'artworks'])->withCount('artworks');

        // Search functionality
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('artworks', function($q) use ($search) {
                      $q->where('title', 'like', "%{$search}%")
                        ->orWhere('artist_name', 'like', "%{$search}%");
                  });
            });
        }

        // Sort functionality
        switch($sort) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'title-asc':
                $query->orderBy('title', 'asc');
                break;
            case 'title-desc':
                $query->orderBy('title', 'desc');
                break;
            case 'most-artworks':
                $query->orderBy('artworks_count', 'desc');
                break;
            case 'least-artworks':
                $query->orderBy('artworks_count', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $collections = $query->paginate(6);

        return response()->json([
            'success' => true,
            'data' => [
                'collections' => $collections->items(),
                'pagination' => [
                    'current_page' => $collections->currentPage(),
                    'last_page' => $collections->lastPage(),
                    'total' => $collections->total(),
                    'per_page' => $collections->perPage()
                ]
            ]
        ]);
    }

    /**
     * حفظ collection جديد - JSON
     */
    public function store(Request $request)
    {
        $request->validate([
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        $coverPath = $request->file('cover_image')->store('collections', 'public');

        $collection = Collection::create([
            'artist_id' => $request->artist_id,
            'title' => $request->title,
            'description' => $request->description,
            'cover_image' => $coverPath
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Collection created successfully!',
            'data' => $collection->load(['artist', 'artworks'])
        ], 201);
    }

    /**
     * عرض collection معين - JSON
     */
    public function show(Collection $collection)
    {
        $collection->load(['artist', 'artworks']);
        
        return response()->json([
            'success' => true,
            'data' => $collection
        ]);
    }

    /**
     * تحديث collection - JSON
     */
    public function update(Request $request, Collection $collection)
    {
        $request->validate([
            'artist_id' => 'required|exists:artists,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:500',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        $data = [
            'artist_id' => $request->artist_id,
            'title' => $request->title,
            'description' => $request->description,
        ];

        if ($request->hasFile('cover_image')) {
            // مسح الصورة القديمة
            if ($collection->cover_image) {
                Storage::disk('public')->delete($collection->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('collections', 'public');
        }

        $collection->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Collection updated successfully!',
            'data' => $collection->fresh(['artist', 'artworks'])
        ]);
    }

    /**
     * حذف collection - JSON
     */
    public function destroy(Collection $collection)
    {
        if ($collection->cover_image) {
            Storage::disk('public')->delete($collection->cover_image);
        }
        
        $collection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Collection deleted successfully!'
        ]);
    }

    /**
     * إضافة artworks للـ collection - JSON
     */
    public function addArtworks(Request $request, Collection $collection)
    {
        $request->validate([
            'artwork_ids' => 'required|array',
            'artwork_ids.*' => 'exists:artworks,id'
        ]);

        $collection->artworks()->syncWithoutDetaching($request->artwork_ids);

        return response()->json([
            'success' => true,
            'message' => 'Artworks added to collection!',
            'data' => $collection->fresh(['artist', 'artworks'])
        ]);
    }

    /**
     * إزالة artwork من collection - JSON
     */
    public function removeArtwork(Collection $collection, Artwork $artwork)
    {
        $collection->artworks()->detach($artwork->id);

        return response()->json([
            'success' => true,
            'message' => 'Artwork removed from collection!',
            'data' => $collection->fresh(['artist', 'artworks'])
        ]);
    }
}
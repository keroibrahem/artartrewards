<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'artist_id',
        'title', 
        'description', 
        'cover_image'
    ];

    // العلاقة: collection تابع لفنان
    public function artist()
    {
        return $this->belongsTo(Artist::class);
    }

    // العلاقة: collection فيه كذا artwork
    public function artworks()
    {
        return $this->belongsToMany(Artwork::class, 'artwork_collection')
                    ->withTimestamps();
    }

    // دالة علشان نجيب عدد الـ artworks في الـ collection
    public function getArtworksCountAttribute()
    {
        return $this->artworks()->count();
    }
}
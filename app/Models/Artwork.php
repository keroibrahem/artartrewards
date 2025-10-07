<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'artist_name',
        'price',
        'category',
        'subjects',
        'materials',
        'styles'
    ];

    protected $casts = [
        'subjects' => 'array',
        'materials' => 'array',
        'styles' => 'array',
        'price' => 'decimal:2'
    ];

    // العلاقة: artwork موجود في كذا collection
    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'artwork_collection')
                    ->withTimestamps();
    }
}
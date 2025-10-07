<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'email', 
        'bio', 
        'profile_image'
    ];

    // العلاقة: فنان عنده كذا collection
    public function collections()
    {
        return $this->hasMany(Collection::class);
    }
}
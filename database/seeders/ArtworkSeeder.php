<?php

namespace Database\Seeders;

use App\Models\Artwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArtworkSeeder extends Seeder
{
    public function run()
    {
        $artworks = [
            [
                'title' => 'Rare Bird VI',
                'description' => 'A stunning abstract representation of exotic birds in flight.',
                'image' => 'artworks/bird.jpg',
                'artist_name' => 'Mark Hellbusch',
                'price' => 690.00,
                'category' => 'Painting',
                'subjects' => json_encode(['birds', 'abstract', 'flight']),
                'materials' => json_encode(['acrylic', 'canvas']),
                'styles' => json_encode(['abstract', 'contemporary'])
            ],
            [
                'title' => 'Mountain Dreams',
                'description' => 'Capturing the majestic beauty of mountain ranges at sunrise.',
                'image' => 'artworks/mountain.jpg',
                'artist_name' => 'Sarah Johnson',
                'price' => 850.00,
                'category' => 'Photography',
                'subjects' => json_encode(['mountains', 'nature', 'sunrise']),
                'materials' => json_encode(['digital print']),
                'styles' => json_encode(['landscape', 'fine art'])
            ],
            [
                'title' => 'Ocean Waves',
                'description' => 'Digital interpretation of ocean waves in motion.',
                'image' => 'artworks/ocean.jpg',
                'artist_name' => 'Michael Chen',
                'price' => 720.00,
                'category' => 'Digital Art',
                'subjects' => json_encode(['ocean', 'waves', 'water']),
                'materials' => json_encode(['digital']),
                'styles' => json_encode(['digital', 'abstract'])
            ],
            [
                'title' => 'Urban Life',
                'description' => 'Mixed media exploration of city life and architecture.',
                'image' => 'artworks/urban.jpg',
                'artist_name' => 'Emma Davis',
                'price' => 950.00,
                'category' => 'Mixed Media',
                'subjects' => json_encode(['city', 'architecture', 'urban']),
                'materials' => json_encode(['acrylic', 'paper', 'found objects']),
                'styles' => json_encode(['contemporary', 'mixed media'])
            ],
            [
                'title' => 'Desert Soul',
                'description' => 'Sculpture inspired by desert landscapes and ancient forms.',
                'image' => 'artworks/desert.jpg',
                'artist_name' => 'Alex Rodriguez',
                'price' => 680.00,
                'category' => 'Sculpture',
                'subjects' => json_encode(['desert', 'nature', 'ancient']),
                'materials' => json_encode(['clay', 'stone', 'metal']),
                'styles' => json_encode(['sculpture', 'contemporary'])
            ],
            [
                'title' => 'Forest Magic',
                'description' => 'Enchanting forest scene with mystical elements.',
                'image' => 'artworks/forest.jpg',
                'artist_name' => 'Mark Hellbusch',
                'price' => 890.00,
                'category' => 'Painting',
                'subjects' => json_encode(['forest', 'magic', 'nature']),
                'materials' => json_encode(['oil', 'canvas']),
                'styles' => json_encode(['fantasy', 'realism'])
            ],
            [
                'title' => 'Sunset Glow',
                'description' => 'Photographic capture of golden hour landscapes.',
                'image' => 'artworks/sunset.jpg',
                'artist_name' => 'Sarah Johnson',
                'price' => 780.00,
                'category' => 'Photography',
                'subjects' => json_encode(['sunset', 'landscape', 'golden hour']),
                'materials' => json_encode(['digital print']),
                'styles' => json_encode(['landscape', 'fine art'])
            ],
            [
                'title' => 'Winter Mist',
                'description' => 'Digital art piece depicting mysterious winter scenes.',
                'image' => 'artworks/winter.jpg',
                'artist_name' => 'Michael Chen',
                'price' => 920.00,
                'category' => 'Digital Art',
                'subjects' => json_encode(['winter', 'mist', 'landscape']),
                'materials' => json_encode(['digital']),
                'styles' => json_encode(['digital', 'surreal'])
            ]
        ];

        foreach ($artworks as $artwork) {
            Artwork::create($artwork);
        }
    }
}
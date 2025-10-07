<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\Artwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    public function run()
    {
        $collections = [
            [
                'artist_id' => 1,
                'title' => 'Abstract Expressions',
                'description' => 'A collection of vibrant abstract paintings exploring color and form.',
                'cover_image' => 'collections/abstract.jpg'
            ],
            [
                'artist_id' => 2,
                'title' => 'Nature Photography',
                'description' => 'Stunning photographic captures of natural landscapes and wildlife.',
                'cover_image' => 'collections/nature.jpg'
            ],
            [
                'artist_id' => 3,
                'title' => 'Digital Dreams',
                'description' => 'Immersive digital artworks pushing the boundaries of virtual reality.',
                'cover_image' => 'collections/digital.jpg'
            ],
            [
                'artist_id' => 4,
                'title' => 'Urban Explorations',
                'description' => 'Mixed media works exploring modern city life and architecture.',
                'cover_image' => 'collections/urban.jpg'
            ],
            [
                'artist_id' => 5,
                'title' => 'Sculptural Forms',
                'description' => 'Contemporary sculptures exploring materiality and space.',
                'cover_image' => 'collections/sculpture.jpg'
            ]
        ];

        foreach ($collections as $collection) {
            $newCollection = Collection::create($collection);
            
            // إضافة artworks عشوائية لكل collection
            $artworks = Artwork::inRandomOrder()->limit(3)->get();
            $newCollection->artworks()->attach($artworks);
        }
    }
}
<?php

namespace Database\Seeders;

use App\Models\Artist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArtistSeeder extends Seeder
{
    public function run()
    {
        $artists = [
            [
                'name' => 'Mark Hellbusch',
                'email' => 'mark@artist.com',
                'bio' => 'Contemporary artist specializing in abstract paintings.',
                'profile_image' => 'artists/mark.jpg'
            ],
            [
                'name' => 'Sarah Johnson', 
                'email' => 'sarah@artist.com',
                'bio' => 'Photographer capturing natural landscapes and urban scenes.',
                'profile_image' => 'artists/sarah.jpg'
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael@artist.com', 
                'bio' => 'Digital artist creating immersive virtual experiences.',
                'profile_image' => 'artists/michael.jpg'
            ],
            [
                'name' => 'Emma Davis',
                'email' => 'emma@artist.com',
                'bio' => 'Mixed media artist exploring texture and form.',
                'profile_image' => 'artists/emma.jpg'
            ],
            [
                'name' => 'Alex Rodriguez',
                'email' => 'alex@artist.com',
                'bio' => 'Sculptor working with natural materials and metals.',
                'profile_image' => 'artists/alex.jpg'
            ]
        ];

        foreach ($artists as $artist) {
            Artist::create($artist);
        }
    }
}
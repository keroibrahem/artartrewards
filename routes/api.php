<?php

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ArtworkController;
use Illuminate\Support\Facades\Route;

// Collections API
Route::apiResource('collections', CollectionController::class);
Route::post('collections/{collection}/artworks', [CollectionController::class, 'addArtworks']);
Route::delete('collections/{collection}/artworks/{artwork}', [CollectionController::class, 'removeArtwork']);

// Artworks API
Route::apiResource('artworks', ArtworkController::class);
Route::get('artworks/available', [ArtworkController::class, 'availableArtworks']);

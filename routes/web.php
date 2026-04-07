<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Serve the React app for all frontend routes handled by React Router.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
